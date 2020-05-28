const config = require("../config.json");
const osu = require("../osu.js");

module.exports.run = async (message, args) => {

    var position;
    var username;

    if (args.includes('-p')) {
        position = args[args.indexOf('-p') + 1] - 1;
        args.splice(args.indexOf('-p'), 2);
    }
    else position = 0;

    if (args.length > 0) username = args.join(" ");
    else {
        var found = false;
        for (var i = 0; i < statObj.users.length; i++) {
            if (statObj.users[i].discord == message.author.id) {
                username = statObj.users[i].osu_id;
                found = true;
                break;
            }
        }
        if (!found) return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${config.prefix}osuset <user>\`.`)
    }

    let s = await osu.recent(username, message, position);
    if (s.error) return message.channel.send(s.error);

    let embed = {
        color: message.member.displayColor,
        author: {
            name: `Most recent osu! play for ${s.username}:`,
            icon_url: `${s.avatar}?${+new Date()}`,
            url: s.url
        },
        thumbnail: {
            url: s.banner,
        },
        description: `**[${s.artist} - ${s.title} \[${s.difficulty}\]](https://osu.ppy.sh/b/${s.mapid})**`,
        fields: [
            {
                name: `**${s.mods == "" ? "NM" : s.mods}** (${s.stars}★) \xa0 — \xa0 ${s.ago}`,
                value: `${s.grade} \xa0 — \xa0 ${s.pp} \xa0 — \xa0 **${s.accuracy.toFixed(2)}%**
                ${s.score.toLocaleString()} \xa0 — \xa0 **x${s.combo.toLocaleString()}**/${s.maxcombo.toLocaleString()} \xa0 — \xa0 [${s.c300.toLocaleString()}/${s.c100.toLocaleString()}/${s.c50.toLocaleString()}/${s.cmiss.toLocaleString()}]${s.finished == true ? "" : "\n" + (s.completion * 100).toFixed(2) + "% completion"}`
            }
        ]
    }

    return message.channel.send({ embed: embed });
};

module.exports.help = {
    name: "recent",
    aliases: ["r", "rs"],
    description: "Show a user's most recent play on osu!\n\nParameters:\n\`-p <number>\` for specific position",
    usage: "recent [<user>]",
    example: "recent shdewz",
    category: "osu!"
}