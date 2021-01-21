const moment = require("moment");
const osu = require("../osu.js");

module.exports.run = async (message, args, client) => {
    let mapid = 0;
    let regex = /^<?((https?:\/\/)?osu.ppy.sh\/(b|beatmapsets\/\d+(#osu)?)\/)?\d+>?$/;
    if (args.filter(a => a.match(regex)).length > 0) mapid = args.filter(a => a.match(regex))[0].match(/\d+/g).pop();
    else {
        let server = statObj.serverstats.find(s => s.id == message.guild.id);
        if (server) {
            let channel = server.channels.find(c => c.id == message.channel.id);
            if (channel && channel.content.lastBeatmap) mapid = channel.content.lastBeatmap;
        }
        if (mapid == 0) return message.reply("no beatmaps found in the channel.");
    }

    let mods = args.filter(a => a.startsWith("+")).length > 0 ? args.filter(a => a.startsWith("+"))[0].toUpperCase().substring(1) : "";

    let m = await osu.getMap(mapid, mods);
    osu.addLastMap(message, m.map.id);

    let lb = [];
    m.lb.forEach((l, i) => {
        let obj = {
            a: `\`#${i + 1}\` ${l.grade} **[${l.username}](https://osu.ppy.sh/u/${l.user_id})**`,
            b: `**+${l.mods.join("") == "" ? "NM" : l.mods.join("")}** \u200b \`x${l.combo}\` \u200b \`${(l.acc * 100).toFixed(2)}%\``,
            c: `**\`${l.pp.toFixed(0)}pp\` \u200b **${l.replay ? ` [Replay](${l.replay})` : ""}`
        }
        lb.push(obj);
    });

    let lbfields = lb.length == 0 ? "" : [{
        name: `Leaderboard`,
        value: lb.map(l => l.a).join("\n"),
        inline: true
    },
    {
        name: "\u200b",
        value: lb.map(l => l.b).join("\n"),
        inline: true
    },
    {
        name: "\u200b",
        value: lb.map(l => l.c).join("\n"),
        inline: true
    }];

    let embed = {
        color: message.member.displayColor,
        author: {
            name: `${m.map.artist} - ${m.map.title}`,
            url: `https://osu.ppy.sh/b/${m.map.id}`
        },
        thumbnail: {
            url: m.map.banner,
        },
        description: `Mapped by **${m.map.mapper}**\n**Length:** ${String(moment.duration(m.map.total_length * 1000).minutes()).padStart(2, '0')}:${String(moment.duration(m.map.total_length * 1000).seconds()).padStart(2, '0')} (${String(moment.duration(m.map.hit_length * 1000).minutes()).padStart(2, '0')}:${String(moment.duration(m.map.hit_length * 1000).seconds()).padStart(2, '0')}) \u200b **BPM:** ${m.map.bpm.toLocaleString()} \u200b **Mods:** +${mods == "" ? "NM" : mods.replace(/[^a-zA-Z]/g, "")}`,
        fields: [
            {
                name: `**[${m.map.diff}]**`,
                value: `**CS:** ${Math.round(m.map.stats.cs * 10) / 10} \u200b **AR:** ${Math.round(m.map.stats.ar * 10) / 10} \u200b **OD:** ${Math.round(m.map.stats.od * 10) / 10} \u200b **HP:** ${Math.round(m.map.stats.hp * 10) / 10}\n**Difficulty:** ${m.map.stars.toFixed(2)}★ \u200b **Max combo:** x${m.map.maxcombo.toLocaleString()}\n**PP:** | ${m.map.pps.map(p => `**${p.acc.toFixed(0)}%** \`${p.pp.toFixed(0)}pp\``).join(" | ")}`,
                inline: false,
            },
            lb.length > 0 ? lbfields : { name: `Leaderboard`, value: "No leaderboard scores." }
        ]
    }

    return message.channel.send({ embed: embed })
};

module.exports.help = {
    name: "map",
    aliases: ["m"],
    description: "Show basic stats of an osu! map.",
    usage: "map [<mapid>] [<mods>]",
    example: "map 668662 +HR",
    category: "osu!"
}