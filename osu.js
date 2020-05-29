const axios = require("axios");
const fs = require("fs");
const moment = require("moment");

const readline = require("readline");
const request = require('request');
const osu = require("ojsama");

let api, apikey;

const rankemojis = ["<:rankingF:691413465830522912>", "<:rankingD:691413465834717237>", "<:rankingC:691413466036043777>", "<:rankingB:691413466040238170>", "<:rankingA:691413466019397693>", "<:rankingS:691413466048626709>", "<:rankingSH:691413466061209720>", "<:rankingX:691413467634335895>", "<:rankingXH:691413465813745756>"];
const ranknames = ["F", "D", "C", "B", "A", "S", "SH", "X", "XH"];

const mods_enum = {
    'NM': 0,
    'NF': 1,
    'EZ': 2,
    'TD': 4,
    'HD': 8,
    'HR': 16,
    'SD': 32,
    'DT': 64,
    'RX': 128,
    'HT': 256,
    'NC': 512,
    'FL': 1024,
    'AT': 2048,
    'SO': 4096,
    'AP': 8192,
    'PF': 16384,
    '4K': 32768,
    '5K': 65536,
    '6K': 131072,
    '7K': 262144,
    '8K': 524288,
    'FI': 1048576,
    'RD': 2097152,
    'LM': 4194304,
    '9K': 16777216,
    '10K': 33554432,
    '1K': 67108864,
    '3K': 134217728,
    '2K': 268435456,
    'V2': 536870912,
    'MR': 1073741824
};

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
                resolve({ error: err.name + ": " + err.message });
                return;
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

                let c50 = parseInt(eventdata.count50);
                let c100 = parseInt(eventdata.count100);
                let c300 = parseInt(eventdata.count300);
                let cmiss = parseInt(eventdata.countmiss);
                let combo = parseInt(eventdata.maxcombo);
                let score = parseInt(eventdata.score);
                let acc = getAcc(c300, c100, c50, cmiss) * 100;

                let mods = eventdata.enabled_mods;
                let modsNames = getMods(mods).join("");
                let modsText = "";
                if (mods != 0) modsText = `${modsNames}`;

                let modsParam = '0';
                if (modsNames.includes("HR")) modsParam = '16';
                else if (modsNames.includes("DT") || modsText.includes("NC")) modsParam = '64';
                else if (modsNames.includes("HT")) modsParam = '256';
                else if (modsNames.includes("EZ")) modsParam = '2';

                let grade = rankemojis[ranknames.indexOf(eventdata.rank)];
                let finished = eventdata.rank == "F" ? false : true;
                let sincePlay = moment.utc(eventdata.date).fromNow();

                let map = await getMapData(beatmap, modsParam);

                let hits = c300 + c100 + c50 + cmiss;
                let completion = hits / map.objects;

                let pp = await getPP(beatmap, mods, combo, acc, cmiss);
                let ppText = `**${pp.toFixed(2)}pp**`;

                if (combo != map.maxcombo) {
                    let fcpp = await getFCPP(beatmap, mods, acc);
                    ppText = `**${pp.toFixed(2)}pp** / ${fcpp.toFixed(2)}pp`;
                }

                addLastMap(message, beatmap);

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
                    c300: c300,
                    c100: c100,
                    c50: c50,
                    cmiss: cmiss,
                    pp: ppText,
                    ago: sincePlay,
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
                resolve({ error: err.name + ": " + err.message });
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

                    let c50 = parseInt(score.count50);
                    let c100 = parseInt(score.count100);
                    let c300 = parseInt(score.count300);
                    let cmiss = parseInt(score.countmiss);
                    let combo = parseInt(score.maxcombo);
                    let acc = getAcc(c300, c100, c50, cmiss) * 100;

                    let mods = score.enabled_mods;
                    let modsNames = getMods(mods).join("");
                    let modsText = mods != 0 ? modsNames : "";
                    let modsParam = getModsParam(modsNames);

                    let map = await getMapData(mapID, modsParam);
                    let fcpp = combo != map.maxcombo ? await getFCPP(mapID, mods, acc) : 0;

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
                        c300: c300,
                        c100: c100,
                        c50: c50,
                        cmiss: cmiss,
                        pp: Number(score.pp),
                        fcpp: Number(fcpp),
                        date: moment.utc(score.date).valueOf()
                    }

                    scores.push(obj);
                }

                if (message) addLastMap(message, mapID);

                resolve({ stats: mainobj, scores: scores });
            }).catch(err => {
                if (err.status == 404) {
                    resolve({ error: `No scores found for ${userobj.username}.` });
                    return;
                }
                else {
                    console.log(err);
                    resolve({ error: err.name + ": " + err.message });
                    return;
                }
            });
        });
    },

    getTop: async function (userID, limit, length, sortby, reverse) {
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
                    response[i].date = moment.utc(response[i].date).valueOf()
                    response[i].acc = getAcc(response[i].count300, response[i].count100, response[i].count50, response[i].countmiss) * 100;
                }

                response.sort(GetSortOrder(sortby));
                if (!reverse) response.reverse();

                for (var i = 0; i < length; i++) {
                    let score = response[i];

                    let c50 = parseInt(score.count50);
                    let c100 = parseInt(score.count100);
                    let c300 = parseInt(score.count300);
                    let cmiss = parseInt(score.countmiss);
                    let combo = parseInt(score.maxcombo);
                    let acc = getAcc(c300, c100, c50, cmiss) * 100;

                    let mods = score.enabled_mods;
                    let modsNames = getMods(mods).join("");
                    let modsText = mods != 0 ? modsNames : "";
                    let modsParam = getModsParam(modsNames);

                    let map = await getMapData(score.beatmap_id, modsParam);
                    let fcpp = combo != map.maxcombo ? await getFCPP(score.beatmap_id, mods, acc) : 0;

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
                        difficulty: map.diff,
                        mapid: score.beatmap_id,
                        mods: modsText,
                        stars: Number(map.stars),
                        acc: acc,
                        score: Number(score.score),
                        grade: rankemojis[ranknames.indexOf(score.rank)],
                        combo: combo,
                        maxcombo: map.maxcombo,
                        c300: c300,
                        c100: c100,
                        c50: c50,
                        cmiss: cmiss,
                        pp: Number(score.pp),
                        fcpp: Number(fcpp),
                        date: moment.utc(score.date).valueOf()
                    }

                    plays.push(obj);
                }

                resolve({ user: userobj, plays: plays });
            }).catch(err => {
                if (err.status == 404) return resolve({ error: `No plays found for ${user.username}.` });
                else {
                    console.log(err);
                    return resolve({ error: err.name + ": " + err.message });
                }
            });
        });
    }
}

function GetSortOrder(prop) {
    return function (a, b) {
        if (Number(a[prop]) > Number(b[prop])) return 1;
        else if (Number(a[prop]) < Number(b[prop])) return -1;
        return 0;
    }
}

function getModsParam(mods) {
    mods = mods.toUpperCase();
    let modsParam;
    if (mods.includes("HR")) modsParam = 16;
    else if (mods.includes("DT") || mods.includes("NC")) modsParam = 64;
    else if (mods.includes("HT")) modsParam = 256;
    else if (mods.includes("EZ")) modsParam = 2;
    return modsParam;
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
                var stars = new osu.diff().calc({ map: map, mods: mods });
                var max_combo = map.max_combo();

                var pp = osu.ppv2({
                    stars: stars,
                    combo: combo,
                    nmiss: cmiss,
                    acc_percent: acc,
                });

                resolve(pp.total);
            });
    });
}

function getFCPP(mapID, mods, acc) {
    return new Promise(resolve => {
        var cmiss = 0;

        var parser = new osu.parser();
        readline.createInterface({
            input: request.get("https://osu.ppy.sh/osu/" + mapID), terminal: false
        })
            .on("line", parser.feed_line.bind(parser))
            .on("close", function () {

                var map = parser.map;
                var stars = new osu.diff().calc({ map: map, mods: mods });
                var max_combo = map.max_combo();

                var pp = osu.ppv2({
                    stars: stars,
                    combo: max_combo,
                    nmiss: cmiss,
                    acc_percent: acc,
                });

                resolve(pp.total);
            });
    });
}

function addLastMap(message, mapID) {
    var exists = false;
    for (var i = 0; i < statObj.serverstats.length; i++) {
        if (statObj.serverstats[i].id == message.channel.guild.id) {
            for (var j = 0; j < statObj.serverstats[i].channels.length; j++) {
                if (statObj.serverstats[i].channels[j].id == message.channel.id) {
                    exists = true;
                    statObj.serverstats[i].channels[j].content.lastBeatmap = mapID;
                }
            }
            if (!exists) {
                var obj = { "id": message.channel.id, "content": { "lastBeatmap": mapID } };
                statObj.serverstats[i].channels.push(obj);
                exists = true;
            }
        }
    }
    if (!exists) {
        var obj = { "id": message.channel.guild.id, "channels": [{ "id": message.channel.id, "content": { "lastBeatmap": mapID } }] };
        statObj.serverstats.push(obj);
    }
    return;
}

function abbreviateNumber(value) {
    let newValue = value;
    const suffixes = ["", " thousand", " million", " billion", " trillion"];
    let suffixNum = 0;
    while (newValue >= 1000) {
        newValue /= 1000;
        suffixNum++;
    }

    newValue = newValue.toPrecision(3);

    newValue += suffixes[suffixNum];
    return newValue;
}

function getMods(mods) {
    var result = [];
    for (var mod in mods_enum) {
        if ((mods_enum[mod] & mods) != 0)
            result.push(mod);
    }
    return cleanMods(result);
}

function cleanMods(mods) {
    let result = mods;
    if (mods.includes("NC") && mods.includes("DT"))
        result.splice(mods.indexOf("DT"), 1);
    if (mods.includes("PF") && mods.includes("SD"))
        result.splice(mods.indexOf("SD"), 1);
    return result;
}

function getAcc(c300, c100, c50, cmiss) {
    return (c300 * 300 + c100 * 100 + c50 * 50) / (c300 * 300 + c100 * 300 + c50 * 300 + cmiss * 300);
}

async function getMapData(mapid, mods) {
    return new Promise(resolve => {
        api.get('/get_beatmaps', { params: { k: apikey, b: mapid, mods: mods } }).then(async response => {
            response = response.data;

            if (!response || response.length == 0) {
                return console.log(`Beatmap *${beatmap}* not found.`);
            }
            let mapdata = response[0];

            let diff = mapdata.version;
            let title = mapdata.title;
            let artist = mapdata.artist;
            let mapper = mapdata.creator;
            let maxcombo = parseInt(mapdata.max_combo);
            let bpm = parseInt(mapdata.bpm);
            let stars = Number(mapdata.difficultyrating).toFixed(2);
            let beatmapset = mapdata.beatmapset_id;
            let banner = `https://assets.ppy.sh/beatmaps/${beatmapset}/covers/list@2x.jpg`;
            let objects = parseInt(mapdata.count_normal) + parseInt(mapdata.count_slider) + parseInt(mapdata.count_spinner);

            let map = {
                diff: diff,
                title: title,
                artist: artist,
                mapper: mapper,
                maxcombo: maxcombo,
                bpm: bpm,
                stars: stars,
                mapset: beatmapset,
                banner: banner,
                objects: objects
            }

            resolve(map);
        });
    });
}