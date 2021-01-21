const config = require("../config.json");
const osu = require("../osu.js");
const moment = require("moment");
const sortable = ["pp", "date", "combo", "acc", "score", "mapid", "300s", "100s", "50s", "misses"];
const sortable_ = ["pp", "date", "maxcombo", "acc", "score", "beatmap_id", "count300", "count100", "count50", "countmiss"];

module.exports.run = async (message, args) => {
    try {
        let username;
        let found;
        let limit = 5;
        let length = 5;
        let customlength = false;
        let position = 0;
        let reverse = false;
        let sortby = "pp";

        if (args.includes("-l")) {
            limit = Math.max(Math.min(args[args.indexOf("-l") + 1], 8), 1);
            length = limit;
            customlength = true;
            args.splice(args.indexOf("-l"), 2);
        }

        if (args.includes("-p")) {
            position = args[args.indexOf("-p") + 1] - 1;
            if (!customlength) length = 1;
            length = Math.min(length, 100 - position);
            limit = Math.min(Math.max(limit, position + length), 100);
            args.splice(args.indexOf("-p"), 2);
        }

        if (args.includes("-s")) {
            limit = 100;
            sortby = sortable.includes(args[args.indexOf("-s") + 1].toLowerCase()) ? sortable_[sortable.indexOf(args[args.indexOf("-s") + 1].toLowerCase())] : "pp";
            args.splice(args.indexOf("-s"), 2);
        }

        if (args.includes("-r")) { limit = 100; sortby = "date"; args.splice(args.indexOf("-r"), 1); }
        if (args.includes("-reverse")) { reverse = true; args.splice(args.indexOf("-reverse"), 1); }

        if (args.length > 0) username = args.join("_");
        else {
            for (var i = 0; i < statObj.users.length; i++) {
                if (statObj.users[i].discord == message.author.id) {
                    username = statObj.users[i].osu_id;
                    found = true;
                    break;
                }
            }
            if (!found) return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${config.prefix}osuset <user>\`.`)
        }



        let s = await osu.getTop(username, limit, length, sortby, reverse, position);
        if (s.error) return message.channel.send(s.error);
        osu.addLastMap(message, s.plays[0].mapid);

        let fields = [];
        for (var i = 0; i < length; i++) {
            fields.push(`**${s.plays[i].position}. [${s.plays[i].title} [${s.plays[i].difficulty}]](https://osu.ppy.sh/b/${s.plays[i].mapid}) ${s.plays[i].mods == "" ? "" : "+" + s.plays[i].mods}** (${s.plays[i].stars.toFixed(2)}★)\n${s.plays[i].grade} — ${s.plays[i].pp} — **${s.plays[i].acc.toFixed(2)}%**\n${s.plays[i].score.toLocaleString()} — **x${s.plays[i].combo.toLocaleString()}**/${s.plays[i].maxcombo.toLocaleString()} — \`[ ${s.plays[i].c300.toLocaleString()} / ${s.plays[i].c100.toLocaleString()} / ${s.plays[i].c50.toLocaleString()} / ${s.plays[i].cmiss.toLocaleString()} ]\`\n**${moment.utc(s.plays[i].date).fromNow()}** (${moment.utc(s.plays[i].date).format("MMMM Do, YYYY")})\n${sortby == "beatmap_id" ? `Map submitted **${moment.utc(s.plays[i].submitdate).fromNow()}** (${moment.utc(s.plays[i].submitdate).format("MMMM Do, YYYY")})\n` : ""}`);
        }

        let embed = {
            color: message.member.displayColor,
            author: {
                name: `Top ${length} osu! plays for ${s.user.username}${position == 0 ? "" : ` starting at #${position + 1}`}`,
                icon_url: `${s.user.flag}?${+new Date()}`,
                url: s.user.url
            },
            thumbnail: {
                url: s.user.avatar,
            },
            title: `${sortby == "pp" && !reverse ? "" : "Sorted by " + sortable[sortable_.indexOf(sortby)] + (reverse == true ? " (reversed)" : "")}`,
            description: fields.join("\n"),
        }

        return message.channel.send({ embed: embed });
    }
    catch (error) {
        return console.log(error);
    }
};

function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) return 1;
        else if (a[prop] < b[prop]) return -1;
        return 0;
    }
}

module.exports.help = {
    name: "osutop",
    description: `Show osu! top plays of someone.\n\nParameters:\n\`-l <length>\` length of the returned list. (1-8, default 5)\n\`-s <property>\` sort the plays by the specified property (see below)\n\`-r\` show recent plays (shorthand for \`-s date\`)\n\`-reverse\` reverses the sorted plays\n\nAvailable properties to sort:\n\`${sortable.join("`, `")}\``,
    usage: "osutop [<user>] [parameters]",
    example: "osutop shdewz -l 3",
    category: "osu!"
}