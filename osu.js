const axios = require("axios");
const fetch = require("node-fetch");
const moment = require("moment");
const config = require("./config.json");

const readline = require("readline");
const request = require('request');
const osu = require("ojsama");
const tools = require("./tools.js");

let api, apikey;

const rankemojis = ["<:rankingF:799961417498230824>", "<:rankingD:799961417197420546>", "<:rankingC:799961417474113536>", "<:rankingB:799961417552887870>", "<:rankingA:799961417431777290>", "<:rankingS:799961417490366464>", "<:rankingSH:799961417481715722>", "<:rankingX:799961417637822495>", "<:rankingXH:799961496062132225>"];
const ranknames = ["F", "D", "C", "B", "A", "S", "SH", "X", "XH"];

module.exports = {
    init: function (api_key) {
        if (api_key) {
            apikey = api_key;
            api = axios.create({
                baseURL: 'https://osu.ppy.sh/api',
            });
        }
    },

    getUser: async function (user) {
        return new Promise(async resolve => {
            api.get('/get_user', { params: { k: apikey, u: user } }).then(async response => {
                response = response.data;

                if (response.length == 0) {
                    resolve({ error: `User **${user}** not found.` });
                    return;
                }
                let data = response[0];

                return resolve({
                    username: data.username,
                    id: data.user_id,
                    url: `https://osu.ppy.sh/users/${data.user_id}`,
                    avatar: `https://a.ppy.sh/${data.user_id}`,
                    acc: Number(data.accuracy),
                    playcount: Number(data.playcount),
                    playtime: Number((data.total_seconds_played) / 60 / 60), // convert to hours
                    score: Number(data.ranked_score),
                    pp: Number(data.pp_raw),
                    rank: Number(data.pp_rank),
                    country: data.country,
                    countryrank: Number(data.pp_country_rank),
                    level: Number(data.level),
                    progress: Number((data.level - Math.floor(data.level)) * 100),
                });
            }).catch(err => {
                console.log(err);
                resolve({ error: `**${err.name}:** ${err.message}` });
                return;
            });
        });
    },

    getUser_v2: async function (user) {
        return new Promise(async resolve => {
            let auth = await getAuth(config.keys.osu.client_id, config.keys.osu.client_secret);

            fetch(`https://osu.ppy.sh/api/v2/users/${user}`, {
                headers: {
                    Authorization: `Bearer ${auth.access_token}`
                }
            }).then(async response => {
                let data = await response.json();
                if (data.length == 0) resolve({ error: `User **${user}** not found.` });
                resolve(data);
            }).catch(err => {
                console.log(err);
                resolve({ error: `**${err.name}:** ${err.message}` });
            });
        });
    },

    setUser: async function (user, message) { // add promise later
        api.get('/get_user', { params: { k: apikey, u: user } }).then(async response => {
            response = response.data;

            if (response.length == 0) {
                return message.channel.send(`User *${user}* not found.`);
            }

            let data = response[0];
            let username = data.username;
            let id = data.user_id;
            let url = `https://osu.ppy.sh/users/${id}`;
            let avatar = `https://a.ppy.sh/${id}`;

            let embed = {
                color: message.member.displayColor,
                author: {
                    name: `Succesfully linked to osu! account ${username}!`,
                    icon_url: `${avatar}?${+new Date()}`,
                    url: url
                }
            }

            var exists = false;

            for (var i = 0; i < statObj.users.length; i++) {
                if (statObj.users[i].discord == message.author.id) {
                    statObj.users[i].osu_id = id;
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                var obj = { "discord": message.author.id, "osu_id": id };
                statObj.users.push(obj);
            }

            return message.channel.send({ embed: embed });
        }).catch(err => {
            if (err.status == 404)
                message.channel.send(`User *${user}* not found.`);
            else
                message.channel.send("Something went wrong!");
            console.log(err);
            return;
        });
    },

    recent: async function (user, message, position) {
        return new Promise(async resolve => {
            let userobj = await this.getUser(user, false);
            if (userobj.error) {
                resolve({ error: userobj.error });
                return;
            }

            api.get('/get_user_recent', { params: { k: apikey, u: userobj.id } }).then(async response => {
                response = response.data;

                if (response.length == 0) {
                    resolve({ error: `No recent plays found for ${userobj.username}.` });
                    return;
                }

                if (!position) position = 0;
                let eventdata = response[position];

                let beatmap = eventdata.beatmap_id;

                let hits = {
                    c50: parseInt(eventdata.count50),
                    c100: parseInt(eventdata.count100),
                    c300: parseInt(eventdata.count300),
                    cmiss: parseInt(eventdata.countmiss)
                }

                let combo = parseInt(eventdata.maxcombo);
                let score = parseInt(eventdata.score);
                let acc = tools.osu.getAcc(hits.c300, hits.c100, hits.c50, hits.cmiss) * 100;

                let mods = eventdata.enabled_mods;
                let modsNames = tools.osu.getMods(mods).join("");
                let modsText = mods != 0 ? modsNames : "";

                let modsParam = mods == 0 ? 0 : tools.osu.modsToParam(modsNames);

                let grade = rankemojis[ranknames.indexOf(eventdata.rank)];
                let finished = eventdata.rank == "F" ? false : true;
                let date = moment.utc(eventdata.date).valueOf();

                let map = await getMapData(beatmap, modsParam);

                let totalhits = Object.values(hits).reduce((a, b) => a + b);
                let completion = totalhits / map.objects;

                let ppText = await getPPText(map, mods, combo, hits, -1);

                return resolve({
                    username: userobj.username,
                    avatar: userobj.avatar,
                    url: userobj.url,
                    banner: map.banner,
                    artist: map.artist,
                    title: map.title,
                    mapid: beatmap,
                    difficulty: map.diff,
                    mods: modsText,
                    stars: map.stars,
                    score: score,
                    accuracy: acc,
                    grade: grade,
                    combo: combo,
                    maxcombo: map.maxcombo,
                    c300: hits.c300,
                    c100: hits.c100,
                    c50: hits.c50,
                    cmiss: hits.cmiss,
                    pp: ppText,
                    date: date,
                    finished: finished,
                    completion: completion
                })
            });
        }).catch(err => {
            if (err.status == 404) {
                resolve({ error: `User **${user}** not found.` });
                return;
            }
            else {
                console.log(err);
                resolve({ error: `**${err.name}:** ${err.message}` });
                return;
            }
        });
    },

    scores: async function (userID, mapID, message) {
        return new Promise(async resolve => {

            let user = await this.getUser(userID);
            if (user.error) return resolve({ error: user.error });

            api.get('/get_scores', { params: { k: apikey, u: user.id, b: mapID } }).then(async response => {
                response = response.data;

                let mapstats = await getMapData(mapID, 0);

                if (response.length == 0) return resolve({ error: `No scores found for **${user.username}** on **${mapstats.title} [${mapstats.diff}]**.` });

                let scores = [];
                let mainobj = {};

                for (var i = 0; i < response.length; i++) {
                    let score = response[i];

                    let hits = {
                        c50: parseInt(score.count50),
                        c100: parseInt(score.count100),
                        c300: parseInt(score.count300),
                        cmiss: parseInt(score.countmiss)
                    }

                    let combo = parseInt(score.maxcombo);
                    let acc = tools.osu.getAcc(hits.c300, hits.c100, hits.c50, hits.cmiss) * 100;

                    let mods = score.enabled_mods;
                    let modsNames = tools.osu.getMods(mods).join("");
                    let modsText = mods != 0 ? modsNames : "";
                    let modsParam = mods == 0 ? 0 : tools.osu.modsToParam(modsNames);

                    let map = await getMapData(mapID, modsParam);

                    let ppText = await getPPText(map, mods, combo, hits, score.pp);

                    mainobj = {
                        username: user.username,
                        avatar: user.avatar,
                        url: user.url,
                        banner: map.banner,
                        artist: map.artist,
                        title: map.title,
                        mapid: mapID,
                        difficulty: map.diff,
                        maxcombo: map.maxcombo
                    }

                    let obj = {
                        mods: modsText,
                        stars: Number(map.stars),
                        accuracy: acc,
                        score: Number(score.score),
                        grade: rankemojis[ranknames.indexOf(score.rank)],
                        combo: combo,
                        c300: hits.c300,
                        c100: hits.c100,
                        c50: hits.c50,
                        cmiss: hits.cmiss,
                        ppText: ppText,
                        date: moment.utc(score.date).valueOf()
                    }

                    scores.push(obj);
                }

                resolve({ stats: mainobj, scores: scores.slice(0, Math.min(8, scores.length)) });
            }).catch(err => {
                if (err.status == 404) {
                    resolve({ error: `No scores found for ${userobj.username}.` });
                    return;
                }
                else {
                    console.log(err);
                    resolve({ error: `**${err.name}:** ${err.message}` });
                    return;
                }
            });
        });
    },

    getTop: async function (userID, limit, length, sortby, reverse, position) {
        return new Promise(async resolve => {

            let user = await this.getUser(userID);
            if (user.error) return resolve({ error: user.error });

            api.get('/get_user_best', { params: { k: apikey, u: user.id, limit: limit } }).then(async response => {
                response = response.data;

                if (response.length == 0) return resolve({ error: `No plays found for **${user.username}**.` });

                let plays = [];
                let userobj = {};

                if (typeof sortby == undefined) sortby = "pp";

                for (var i = 0; i < response.length; i++) {
                    response[i].position = i + 1;
                    response[i].date = moment.utc(response[i].date).valueOf();
                    response[i].acc = tools.osu.getAcc(response[i].count300, response[i].count100, response[i].count50, response[i].countmiss) * 100;
                }

                response.sort(GetSortOrder("pp"));
                response.sort(GetSortOrder(sortby));
                if (!reverse) response.reverse();

                if (position > 0) response.splice(0, position);

                for (var i = 0; i < length; i++) {
                    let score = response[i];

                    let hits = {
                        c50: parseInt(score.count50),
                        c100: parseInt(score.count100),
                        c300: parseInt(score.count300),
                        cmiss: parseInt(score.countmiss)
                    }

                    let combo = parseInt(score.maxcombo);
                    let acc = tools.osu.getAcc(hits.c300, hits.c100, hits.c50, hits.cmiss) * 100;

                    let mods = score.enabled_mods;
                    let modsNames = tools.osu.getMods(mods).join("");
                    let modsText = mods != 0 ? modsNames : "";
                    let modsParam = mods == 0 ? 0 : tools.osu.modsToParam(modsNames);

                    let map = await getMapData(score.beatmap_id, modsParam);

                    let ppText = await getPPText(map, mods, combo, hits, score.pp);

                    userobj = {
                        username: user.username,
                        id: user.id,
                        avatar: user.avatar,
                        url: user.url,
                        flag: `https://osu.ppy.sh/images/flags/${user.country}.png`
                    }

                    let obj = {
                        artist: map.artist,
                        title: map.title,
                        banner: map.banner,
                        difficulty: map.diff,
                        mapid: score.beatmap_id,
                        mods: modsText,
                        stars: Number(map.stars),
                        acc: acc,
                        score: Number(score.score),
                        grade: rankemojis[ranknames.indexOf(score.rank)],
                        combo: combo,
                        maxcombo: map.maxcombo,
                        c300: hits.c300,
                        c100: hits.c100,
                        c50: hits.c50,
                        cmiss: hits.cmiss,
                        pp: ppText,
                        date: moment.utc(score.date).valueOf(),
                        position: score.position,
                        submitdate: map.submitted
                    }

                    plays.push(obj);
                }

                resolve({ user: userobj, plays: plays });
            }).catch(err => {
                if (err.status == 404) return resolve({ error: `No plays found for ${user.username}.` });
                else {
                    console.log(err);
                    return resolve({ error: `**${err.name}:** ${err.message}` });
                }
            });
        });
    },

    getMap: async function (mapID, mods, getpps) {
        return new Promise(async resolve => {
            let map = await getMapData(mapID, mods == "" ? 0 : tools.osu.modsToParam(mods), mods, getpps);
            let lb = await getMapLeaderboard(mapID, tools.osu.modsToParamFull(mods));

            let obj = {
                map: map,
                lb: lb
            }

            resolve(obj);
        });
    },

    getMatch: async function (match_id) {
        return new Promise(async resolve => {
            api.get('/get_match', { params: { k: apikey, mp: match_id } }).then(async response => {
                response = response.data;
                if (response.games.length == 0) resolve({ error: `Match **${match_id}** not found.` });
                resolve(response);
            }).catch(err => {
                console.log(err);
                resolve({ error: `**${err.name}:** ${err.message}` });
            });
        });
    },

    addLastMap: function (message, mapID) {
        let server_index = statObj.serverstats.findIndex(s => s.id == message.channel.guild.id);
        if (server_index == -1) {
            let obj = { "id": message.channel.guild.id, "channels": [{ "id": message.channel.id, "content": { "lastBeatmap": mapID } }] };
            statObj.serverstats.push(obj);
        }
        else {
            let channel_index = statObj.serverstats[server_index].channels.findIndex(c => c.id == message.channel.id);
            if (channel_index == -1) {
                let obj = { "id": message.channel.id, "content": { "lastBeatmap": mapID } };
                statObj.serverstats[server_index].channels.push(obj);
            }
            else statObj.serverstats[server_index].channels[channel_index].content.lastBeatmap = mapID;
        }
        return;
    }
}

function GetSortOrder(prop) {
    return function (a, b) {
        if (Number(a[prop]) > Number(b[prop])) return 1;
        else if (Number(a[prop]) < Number(b[prop])) return -1;
        return 0;
    }
}

// pp to string form
async function getPPText(map, mods, combo, hits, pp_) {
    let pp = pp_ != -1 ? Number(pp_) : await getPP(map.id, mods, combo, tools.osu.getAcc(hits.c300, hits.c100, hits.c50, hits.cmiss) * 100, hits.cmiss);
    let ppText = `**${pp.toFixed(2)}pp**`;

    if (combo != map.maxcombo) {
        let fcpp = await getFCPP(map.id, mods, tools.osu.getAcc(hits.c300 + hits.cmiss, hits.c100, hits.c50, 0) * 100);
        ppText = `**${pp.toFixed(2)}pp**/${fcpp.toFixed(2)}pp`;
    }
    return ppText;
}

async function getPP(mapID, mods, combo, acc, cmiss) {
    return new Promise(resolve => {
        cmiss = parseInt(cmiss);
        combo = parseInt(combo);
        acc = parseFloat(acc);

        var parser = new osu.parser();
        readline.createInterface({
            input: request.get("https://osu.ppy.sh/osu/" + mapID), terminal: false
        })
            .on("line", parser.feed_line.bind(parser))
            .on("close", function () {
                var map = parser.map;
                var stars = 0;

                try { stars = new osu.diff().calc({ map: map, mods: mods }); }
                catch (err) { console.error(err); return 0.00; }

                var pp = osu.ppv2({
                    stars: stars,
                    combo: combo,
                    nmiss: cmiss,
                    mods: mods,
                    acc_percent: acc,
                });

                resolve(pp.total);
            });
    }).catch(err => {
        console.error(err);
        return 0.00;
    });
}

async function getFCPP(mapID, mods, acc) {
    try {
        return new Promise(resolve => {
            var parser = new osu.parser();
            readline.createInterface({
                input: request.get("https://osu.ppy.sh/osu/" + mapID), terminal: false
            })
                .on("line", parser.feed_line.bind(parser))
                .on("close", function () {
                    try {
                        var map = parser.map;
                        var stars = new osu.diff().calc({ map: map, mods: mods });
                        var max_combo = map.max_combo();

                        var pp = osu.ppv2({
                            stars: stars,
                            combo: max_combo,
                            nmiss: 0,
                            mods: mods,
                            acc_percent: acc,
                        });

                        resolve(pp.total);
                    }
                    catch (error) {
                        console.log(error);
                        resolve(0);
                    }
                });
        });
    } catch (err) {
        console.error(err);
        return 0;
    }
}

async function getMapData(mapid, mods, modsfull, getpps) {
    return new Promise(resolve => {
        api.get('/get_beatmaps', { params: { k: apikey, b: mapid, mods: mods } }).then(async response => {
            response = response.data;

            if (!response || response.length == 0) {
                return console.log(`Beatmap *${beatmap}* not found.`);
            }
            let data = response[0];

            let pps = !getpps ? [] : [
                {
                    acc: 95,
                    pp: await getFCPP(mapid, tools.osu.modsToParamFull(modsfull), 95)
                },
                {
                    acc: 98,
                    pp: await getFCPP(mapid, tools.osu.modsToParamFull(modsfull), 98)
                },
                {
                    acc: 99,
                    pp: await getFCPP(mapid, tools.osu.modsToParamFull(modsfull), 99)
                },
                {
                    acc: 100,
                    pp: await getFCPP(mapid, tools.osu.modsToParamFull(modsfull), 100)
                }
            ];

            let modmultiplier = !modsfull ? 1 : ["DT", "NC"].some(m => modsfull.includes(m)) ? 1.5 : modsfull.includes("HT") ? 0.75 : 1;

            let stats = !modsfull ? {
                cs: data.diff_size,
                ar: data.diff_approach,
                od: data.diff_overall,
                hp: data.diff_drain
            } : tools.osu.getModStats(data.diff_size, data.diff_approach, data.diff_overall, data.diff_drain, modsfull);

            let map = {
                id: data.beatmap_id,
                diff: data.version,
                title: data.title,
                artist: data.artist,
                mapper: data.creator,
                total_length: Math.round(data.total_length / modmultiplier),
                hit_length: Math.round(data.hit_length / modmultiplier),
                maxcombo: Number(data.max_combo),
                bpm: Number(data.bpm) * modmultiplier,
                stars: Number(data.difficultyrating),
                mapset: data.beatmapset_id,
                pps: pps,
                stats: stats,
                banner: `https://assets.ppy.sh/beatmaps/${data.beatmapset_id}/covers/list@2x.jpg`,
                objects: Number(data.count_normal) + Number(data.count_slider) + Number(data.count_spinner),
                submitted: moment.utc(data.submit_date).valueOf(),
                ranked: moment.utc(data.approved_date).valueOf(),
                updated: moment.utc(data.last_update).valueOf()
            }

            resolve(map);
        });
    });
}

async function getMapLeaderboard(mapid, mods) {
    return new Promise(resolve => {
        let limit = 5;
        api.get('/get_scores', { params: { k: apikey, b: mapid, mods: mods, limit: limit } }).then(async response => {
            let data = response.data;
            let scores = [];

            data.forEach(score => {
                let obj = {
                    username: score.username,
                    user_id: score.user_id,
                    score: Number(score.score),
                    combo: Number(score.maxcombo),
                    cmiss: Number(score.countmiss),
                    c50: Number(score.count50),
                    c100: Number(score.count100),
                    c300: Number(score.count300),
                    acc: tools.osu.getAcc(score.count300, score.count100, score.count50, score.countmiss),
                    pp: Number(score.pp),
                    replay: score.replay_available == 1 ? `https://osu.ppy.sh/scores/osu/${score.score_id}/download` : false,
                    date: moment.utc(score.date).valueOf(),
                    grade: rankemojis[ranknames.indexOf(score.rank)],
                    mods: tools.osu.getMods(score.enabled_mods)
                }
                scores.push(obj);
            });

            resolve(scores);
        });
    });
}

// api v2 stuff

async function getAuth(client_id, client_secret) {
    return new Promise(resolve => {
        fetch("https://osu.ppy.sh/oauth/token", {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret,
                "scope": "public"
            })
        }).then(async response => {
            let data = await response.json();
            resolve(data);
        });
    });
}