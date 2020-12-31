const config = require("../config.json");
const osu = require("../osu.js");
const moment = require("moment");

module.exports.run = async (message, args) => {

    try {
        let position = 0;
        let username;
        let best = false;

        if (args.includes("-p")) {
            position = args[args.indexOf("-p") + 1] - 1;
            args.splice(args.indexOf("-p"), 2);
        }

        if (args.includes("-b")) {
            best = true;
            args.splice(args.indexOf("-b"), 1);
        }

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

        if (best) {
            let s = await osu.getTop(username, 100, 1, "date", false);
            if (s.error) return message.channel.send(s.error);
            osu.addLastMap(message, s.plays[0].mapid);

            let embed = {
                color: message.member.displayColor,
                author: {
                    name: `Most recent osu! top play for ${s.user.username}:`,
                    icon_url: `${s.user.avatar}?${+new Date()}`,
                    url: s.user.url
                },
                thumbnail: {
                    url: s.plays[0].banner,
                },
                description: `**[${s.plays[0].artist} - ${s.plays[0].title} \[${s.plays[0].difficulty}\]](https://osu.ppy.sh/b/${s.plays[0].mapid})**`,
                fields: [
                    {
                        name: `**${s.plays[0].position}. ${s.plays[0].title} [${s.plays[0].difficulty}] ${s.plays[0].mods == "" ? "" : "+" + s.plays[0].mods}** (${s.plays[0].stars.toFixed(2)}★)`,
                        value: `${s.plays[0].grade} — ${s.plays[0].pp} — **${s.plays[0].acc.toFixed(2)}%**
                        ${s.plays[0].score.toLocaleString()} — **x${s.plays[0].combo.toLocaleString()}**/${s.plays[0].maxcombo.toLocaleString()} — \`[ ${s.plays[0].c300.toLocaleString()} / ${s.plays[0].c100.toLocaleString()} / ${s.plays[0].c50.toLocaleString()} / ${s.plays[0].cmiss.toLocaleString()} ]\`
                        **${moment.utc(s.plays[0].date).fromNow()}** (${moment.utc(s.plays[0].date).format("MMMM Do, YYYY")})\n`
                    }
                ]
            }

            return message.channel.send({ embed: embed });
        }
        else {
            let s = await osu.recent(username, message, position);
            if (s.error) return message.channel.send(s.error);
            osu.addLastMap(message, s.mapid);

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
                        name: `**${s.mods == "" ? "NM" : s.mods}** (${s.stars.toFixed(2)}★) — ${s.ago}`,
                        value: `${s.grade} — ${s.pp} — **${s.accuracy.toFixed(2)}%**
                        ${s.score.toLocaleString()} — **x${s.combo.toLocaleString()}**/${s.maxcombo.toLocaleString()} — \`[ ${s.c300.toLocaleString()} / ${s.c100.toLocaleString()} / ${s.c50.toLocaleString()} / ${s.cmiss.toLocaleString()} ]\`${s.finished == true ? "" : "\n" + (s.completion * 100).toFixed(2) + "% completion"}`
                    }
                ]
            }

            return message.channel.send({ embed: embed });
        }
    }
    catch (error) {
        message.channel.send("Error getting scores.");
        return console.log(error);
    }
};

module.exports.help = {
    name: "recent",
    aliases: ["r", "rs"],
    description: "Show a user's most recent play on osu!\n\nParameters:\n\`-p <number>\` for specific position\n\`-b\` for recent top play",
    usage: "recent [<user>]",
    example: "recent shdewz",
    category: "osu!"
}