const config = require("../config.json");
const osu = require("../osu.js");
const moment = require("moment");
const tools = require('../tools.js');

module.exports.run = async (message, args) => {
    if (args.length == 0) return;

    let map = args.filter(e => e.match(/\d+$/))[0];
    let mapID = map.match(/\d+$/)[0];

    args.splice(args.indexOf(map), 1);

    let user = args.length > 1 ? args.join(" ") : statObj.users.find(u => u.discord == message.author.id).osu_id;
    if (!user) return tools.osu.noAccountAlert(message);

    let embed = await getScores(user, mapID, message);
    if (embed.error) return message.channel.send(embed.error);

    return message.channel.send({ embed: embed })
};

module.exports.score = async (user, mapid, message) => {
    return getScores(user, mapid, message);
}

async function getScores(user, mapid, message) {
    let s = await osu.scores(user, mapid, message);
    if (s.error) return s;

    osu.addLastMap(message, s.stats.mapid);

    let fields = [];
    for (var i = 0; i < s.scores.length; i++) {
        var obj = {
            name: `**${s.scores[i].mods == "" ? "NM" : s.scores[i].mods}** (${s.scores[i].stars.toFixed(2)}★) — ${moment.utc(s.scores[i].date).fromNow()} (${moment.utc(s.scores[i].date).format("MMM Do, YYYY")})`,
            value: `${s.scores[i].grade.emoji} — ${s.scores[i].ppText} — **${s.scores[i].accuracy.toFixed(2)}%**\n${s.scores[i].score.toLocaleString()} — **x${s.scores[i].combo.toLocaleString()}**/${s.stats.maxcombo.toLocaleString()} — \`[ ${s.scores[i].c300.toLocaleString()} / ${s.scores[i].c100.toLocaleString()} / ${s.scores[i].c50.toLocaleString()} / ${s.scores[i].cmiss.toLocaleString()} ]\`\n`
        }
        fields.push(obj);
    }

    let embed = {
        color: s.scores[0].grade.color,
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