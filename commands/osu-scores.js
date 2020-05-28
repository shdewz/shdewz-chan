const config = require("../config.json");
const osu = require("../osu.js");

module.exports.run = async (message, args) => {
    if (args.length == 0) return;

    let username;
    let map = args.join(" ").match(/(<?https?:\/\/)?(osu|old)\.ppy\.sh\/(beatmapsets\/\d+.*|b)?\/\d+>?|\d+/)[0];
    let mapID = map.match(/\d+/g)[map.match(/\d+/g).length - 1];
    args.splice(args.indexOf(map), 1);

    if (args.length > 0) {
        username = args.join(" ");
    }
    else {
        for (var i = 0; i < statObj.users.length; i++) {
            if (statObj.users[i].discord == message.author.id) {
                username = statObj.users[i].osu_id;
                var found = true;
                break;
            }
        }
        if (!found) return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${config.prefix}osuset <user>\`.`)
    }

    let embed = await getScores(username, mapID, message);
    if (embed.error) return message.channel.send(embed.error);

    return message.channel.send({ embed: embed })
};

module.exports.score = async (user, mapid, message) => {
    return getScores(user, mapid, message);
}

async function getScores(user, mapid, message) {
    let s = await osu.scores(user, mapid, message);

    if (s.error) return s;

    let fields = [];
    for (var i = 0; i < s.scores.length; i++) {
        let pptext = s.scores[i].fcpp > 0 ? `**${s.scores[i].pp.toFixed(2)}pp** / ${s.scores[i].fcpp.toFixed(2)}pp` : `**${s.scores[i].pp.toFixed(2)}pp**`;
        var obj = {
            name: `**${s.scores[i].mods == "" ? "NM" : s.scores[i].mods}** (${s.scores[i].stars}★) — ${s.scores[i].ago}`,
            value: `${s.scores[i].grade} \xa0 — \xa0 ${pptext} \xa0 — \xa0 **${s.scores[i].accuracy.toFixed(2)}%**
                ${s.scores[i].score.toLocaleString()} \xa0 — \xa0 **x${s.scores[i].combo.toLocaleString()}**/${s.stats.maxcombo.toLocaleString()} \xa0 — \xa0 [${s.scores[i].c300.toLocaleString()}/${s.scores[i].c100.toLocaleString()}/${s.scores[i].c50.toLocaleString()}/${s.scores[i].cmiss.toLocaleString()}]\n`
        }
        fields.push(obj);
    }

    let embed = {
        color: message.member.displayColor,
        author: {
            name: `${s.stats.artist} - ${s.stats.title} [${s.stats.difficulty}]`,
            icon_url: `${s.stats.avatar}?${+new Date()}`,
            url: "https://osu.ppy.sh/b/" + s.stats.mapid
        },
        thumbnail: {
            url: s.stats.banner,
        },
        description: `**Scores for [${s.stats.username}](${s.stats.url})**`,
        fields: fields
    }

    return embed;
}

module.exports.help = {
    name: "scores",
    aliases: ["sc", "s"],
    description: "Show a user's scores on the provided map",
    usage: "scores [<user>] <map>",
    example: "scores shdewz 1234535",
    category: "osu!"
}