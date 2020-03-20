const config = require("../config.json");
const ytdl = require("ytdl-core");
const search = require("yt-search");
const opusscript = require("opusscript");
const moment = require("moment");

module.exports.run = async (message, args) => {

    try {
        var server = servers[message.guild.id];
        if (!server || !server.dispatcher) return message.reply("not currently playing anything!");
        if (!server.queue[0]) return message.reply("nothing in the queue!");

        var currentRemaining = server.now.seconds - moment(new Date()).diff(moment(server.now.playingSince), "seconds");
        var queueTotal = 0;

        var displayText = "";
        for (var i = 1; i < server.queue.length + 1; i++) {
            var untilSong = currentRemaining + queueTotal;
            var untilText = moment.utc(untilSong * 1000).format('HH:mm:ss');
            displayText += `**#${i}** | **[${server.queuestats[i].title}](${server.queuestats[i].url})**\n*Requested by **${server.queuestats[i].requester}** | Length **${server.queuestats[i].timestamp}** | in about **${untilText}***\n\n`
            queueTotal += server.queuestats[i].seconds;
        }

        let embed = {
            color: message.member.displayColor,
            author: {
                name: `Current queue:`
            },
            description: displayText,
        }

        return message.channel.send({ embed: embed });
    } catch (error) {
        return console.error(error);
    }

};

module.exports.help = {
    name: "queue",
    aliases: ["playlist"],
    description: "Shows the list of videos waiting to be played",
    category: "Music"
}