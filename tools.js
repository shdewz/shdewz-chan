const config = require("./config.json");
const axios = require("axios");
const fs = require("fs");
const moment = require("moment");

module.exports = {
    getLocation: (query, reverse) => {
        return new Promise(async resolve => {
            axios.create({ baseURL: "http://api.positionstack.com/v1" })
                .get(!reverse ? "/forward" : "/reverse", { params: { access_key: config.keys.positionstack, limit: 1, timezone_module: 1, country_module: 1, query: query } })
                .then(async response => {
                    response = response.data.data;
                    if (response.length == 0) resolve({ error: "Error fetching location data." });
                    resolve(response);
                }).catch(err => {
                    resolve({ error: err });
                });
        });
    },
    getTimezone: (lat, long) => {
        return new Promise(async resolve => {
            axios.create({ baseURL: "http://api.timezonedb.com/v2.1" })
                .get("/get-time-zone", { params: { format: "json", key: config.keys.timezone_auth, by: "position", lat: lat, lng: long } })
                .then(async response => {
                    response = response.data
                    if (response.length == 0) resolve({ error: "Error fetching timezone data." });
                    resolve(response);
                });
        });
    },
    ts: () => { return `[${moment().format("HH:mm:ss")}]`; },
    osu: {
        getModStats: (cs_raw, ar_raw, od_raw, hp_raw, mods) => {
            mods = mods.replace("NC", "DT");

            var speed = 1, ar_multiplier = 1, ar, ar_ms;

            if (mods.includes("DT")) {
                speed *= 1.5;
            } else if (mods.includes("HT")) {
                speed *= .75;
            }

            if (mods.includes("HR")) {
                ar_multiplier *= 1.4;
            } else if (mods.includes("EZ")) {
                ar_multiplier *= 0.5;
            }

            ar = ar_raw * ar_multiplier;

            if (ar <= 5) ar_ms = ar0_ms - ar_ms_step1 * ar;
            else ar_ms = ar5_ms - ar_ms_step2 * (ar - 5);

            if (ar_ms < ar10_ms) ar_ms = ar10_ms;
            if (ar_ms > ar0_ms) ar_ms = ar0_ms;

            ar_ms /= speed;

            if (ar <= 5) ar = (ar0_ms - ar_ms) / ar_ms_step1;
            else ar = 5 + (ar5_ms - ar_ms) / ar_ms_step2;

            var cs, cs_multiplier = 1;

            if (mods.includes("HR")) {
                cs_multiplier *= 1.3;
            } else if (mods.includes("EZ")) {
                cs_multiplier *= 0.5;
            }

            cs = cs_raw * cs_multiplier;

            if (cs > 10) cs = 10;

            var od, odms, od_multiplier = 1;

            if (mods.includes("HR")) {
                od_multiplier *= 1.4;
            } else if (mods.includes("EZ")) {
                od_multiplier *= 0.5;
            }

            od = od_raw * od_multiplier;
            odms = od0_ms - Math.ceil(od_ms_step * od);
            odms = Math.min(od0_ms, Math.max(od10_ms, odms));

            odms /= speed;

            od = (od0_ms - odms) / od_ms_step;

            var hp, hp_multiplier = 1;

            if (mods.includes("HR")) {
                hp_multiplier *= 1.4;
            } else if (mods.includes("EZ")) {
                hp_multiplier *= 0.5;
            }

            hp = hp_raw * hp_multiplier;

            if (hp > 10) hp = 10;

            return {
                cs: cs,
                ar: ar,
                od: Math.min(11, od),
                hp: hp
            }
        },
        getAcc: (c300, c100, c50, cmiss) => {
            return (c300 * 300 + c100 * 100 + c50 * 50) / (c300 * 300 + c100 * 300 + c50 * 300 + cmiss * 300);
        },
        getMods: (mods) => {
            var result = [];
            for (var mod in mods_enum) {
                if ((mods_enum[mod] & mods) != 0) result.push(mod);
            }
            return cleanMods(result);
        },
        modsToParam: (mods) => {
            mods = mods.toUpperCase();
            let modsParam = 0;
            if (mods.includes("HR")) modsParam += 16;
            if (mods.includes("DT") || mods.includes("NC")) modsParam += 64;
            if (mods.includes("HT")) modsParam += 256;
            if (mods.includes("EZ")) modsParam += 2;
            return modsParam;
        },
        modsToParamFull: (mods) => {
            if (mods == "") return -1;
            let value = 0;
            mods = mods.replace(/[^a-zA-z]/g, "").match(/.{2}/g);
            mods.forEach(mod => value += mods_enum[mod]);
            return value;
        },
        noAccountAlert: (message) => {
            let server = statObj.serverstats.find(s => s.id == message.guild.id);
            let prefix = server && server.prefix ? server.prefix : config.prefix;
            return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${prefix}osuset <user>\`.`);
        }
    }
}

function cleanMods(mods) {
    let result = mods;
    if (mods.includes("NC") && mods.includes("DT"))
        result.splice(mods.indexOf("DT"), 1);
    if (mods.includes("PF") && mods.includes("SD"))
        result.splice(mods.indexOf("SD"), 1);
    return result;
}

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

const ar_ms_step1 = 120;
const ar_ms_step2 = 150;

const ar0_ms = 1800;
const ar5_ms = 1200;
const ar10_ms = 450;

const od_ms_step = 6;
const od0_ms = 79.5;
const od10_ms = 19.5;