const axios = require("axios");
const fs = require("fs");
const moment = require("moment");

let api = "";
let apikey = "";

const rankemojis = ["<:rankingX:662679799638130698>", "<:rankingXH:662679800862736415>", "<:rankingS:662679799113842690>", "<:rankingSH:662679799453450240>", "<:rankingA:662679799256580096>", "<:rankingB:662679799323688970>", "<:rankingC:662679799294066719>", "<:rankingD:662679799063642129>", "<:rankingD:662679799063642129>"];
const ranknames = ["X", "XH", "S", "SH", "A", "B", "C", "D", "F"];

const mods_enum = {
    'No Mods': 0,
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
    'MI': 1073741824
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

    getUser: async function (user, message) {
        api.get('/get_user', { params: { k: apikey, u: user } }).then(response => {
            response = response.data;

            if (response.length == 0) {
                return message.channel.send(`User *${user}* not found.`);
            }

            let data = response[0];

            // assign stat variables
            let username = data.username;
            let id = data.user_id;
            let url = `https://osu.ppy.sh/users/${id}`;
            let avatar = `https://a.ppy.sh/${id}`;

            let acc = `${Number(data.accuracy).toFixed(2)}`;
            let playcount = Number(data.playcount);
            let playtime = Number((data.total_seconds_played) / 60 / 60).toFixed(); // convert to hours
            let score = Number(data.ranked_score);
            let pp = Number(data.pp_raw).toFixed(2);
            let rank = Number(data.pp_rank);
            let country = data.country;
            let countryrank = Number(data.pp_country_rank);
            let level = Number(data.level).toFixed(3);
            let progress = Number((level - Math.floor(level)) * 100).toFixed(2);

            let joindate = moment(new Date(data.join_date));
            let timediff = moment.duration(moment(Date.now()).diff(joindate));
            let sinceJoin = `${timediff.years()} years, ${timediff.months()} months and ${timediff.days()} days ago`;

            let embed = {
                color: 0xe84393,
                author: {
                    name: `osu! stats for ${username}`,
                    icon_url: `https://osu.ppy.sh/images/flags/${country}.png`,
                    url: url
                },
                thumbnail: {
                    url: avatar,
                },
                description: `**Rank:** *#${rank.toLocaleString()} (#${countryrank.toLocaleString()} ${country})*
                **PP:** *${pp.toLocaleString()}pp*
                **Accuracy:** *${acc}%*
                **Playcount:** *${playcount.toLocaleString()}*
                **Ranked Score:** *${abbreviateNumber(score)}*
                **Playtime:** *${playtime} hours*
                **Level:** *${Math.floor(level)} (${progress}%)*`
            }

            return message.channel.send({ embed: embed });
        }).catch(err => {
            if (err.status == 404)
                message.channel.send("User not found.");
            else
                message.channel.send("Something went wrong!");
            console.log(err);
            return;
        });
    },

    setUser: async function (user, message, client) {
        api.get('/get_user', { params: { k: apikey, u: user } }).then(response => {
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
                color: 0xe84393,
                author: {
                    name: `Succesfully linked to osu! account ${username}!`,
                    icon_url: `${avatar}?${+new Date()}`,
                    url: url
                }
            }

            var stat = client.commands.get("loadstats").run(); // load stats
            var exists = false;

            for (var i = 0; i < stat.users.length; i++) {
                if (stat.users[i].discord == message.author.id) {
                    stat.users[i].osu_id = id;
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                var obj = { "discord": message.author.id, "osu_id": id };
                stat.users.push(obj);
            }

            fs.writeFile("stats.json", JSON.stringify(stat), function (err) {
                if (err) return console.log("error", err);
                return message.channel.send({ embed: embed });
            });
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
        api.get('/get_user', { params: { k: apikey, u: user } }).then(response => {
            response = response.data;

            if (response.length == 0) {
                return message.channel.send(`User *${user}* not found.`);
            }

            let data = response[0];

            let username = data.username;
            let id = data.user_id;
            let url = `https://osu.ppy.sh/users/${id}`;
            let avatar = `https://a.ppy.sh/${id}`;

            api.get('/get_user_recent', { params: { k: apikey, u: user } }).then(response => {
                response = response.data;

                if (response.length == 0) {
                    return message.channel.send(`No recent plays found for *${user}*.`);
                }

                if (!position) position = 0;
                let eventdata = response[position];

                let beatmap = eventdata.beatmap_id;
                let score = eventdata.score;
                let mods = eventdata.enabled_mods;
                let modsText = getMods(mods);
                let modsParam = '0';
                if (modsText.includes("HR")) modsParam = '16';
                else if (modsText.includes("DT") || modsText.includes("NC")) modsParam = '64';
                else if (modsText.includes("HT")) modsParam = '256';
                else if (modsText.includes("EZ")) modsParam = '2';
                let rank = rankemojis[ranknames.indexOf(eventdata.rank)];;
                let sincePlay = moment(new Date(eventdata.date)).fromNow();

                api.get('/get_beatmaps', { params: { k: apikey, b: beatmap, mods: modsParam } }).then(response => {
                    response = response.data;

                    if (response.length == 0) {
                        return message.channel.send(`Beatmap *${beatmap}* not found.`);
                    }
                    let mapdata = response[0];

                    let diff = mapdata.version;
                    let title = mapdata.title;
                    let artist = mapdata.artist;
                    let mapper = mapdata.creator;
                    let bpm = mapdata.bpm;
                    let stars = Number(mapdata.difficultyrating).toFixed(2);
                    let beatmapset = mapdata.beatmapset_id;
                    let banner = `https://assets.ppy.sh/beatmaps/${beatmapset}/covers/list@2x.jpg`

                    let embed = {
                        color: 0xe84393,
                        author: {
                            name: `Recent osu! play for ${username}`,
                            icon_url: `${avatar}?${+new Date()}`,
                            url: url
                        },
                        thumbnail: {
                            url: banner,
                        },
                        description: `**[${artist} - ${title}](https://osu.ppy.sh/b/${beatmap})**
                        [${diff}] **+${modsText.join("")}** (${stars}★)`,
                        footer: {
                            text: `Play set ${sincePlay}`
                        }
                    }
                    return message.channel.send({ embed: embed });
                });
            });

        }).catch(err => {
            if (err.status == 404)
                message.channel.send(`User *${user}* not found.`);
            else
                message.channel.send("Something went wrong!");
            console.log(err);
            return;
        });
    }
}

function abbreviateNumber(value) {
    let newValue = value;
    const suffixes = ["", "k", "m", "b", "t"];
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
    return sanitizeMods(result);
}

function sanitizeMods(mods) {
    let result = mods;
    if (mods.includes("NC") && mods.includes("DT"))
        result.splice(mods.indexOf("DT"), 1);
    if (mods.includes("PF") && mods.includes("SD"))
        result.splice(mods.indexOf("SD"), 1);
    return result;
}