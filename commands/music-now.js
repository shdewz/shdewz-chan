const config = require("../config.json");
const ytdl = require("ytdl-core");
const search = require("yt-search");
const opusscript = require("opusscript");
const moment = require("moment");

module.exports.run = async (message, args) => {

    var server = servers[message.guild.id];
    if (!server || !server.dispatcher) return message.reply("not currently playing anything!");

    var current = new Date();
    var timeNow = moment.utc(server.now.timeNow).format("HH:mm:ss [UTC]")
    var progress = moment.utc(moment(current).diff(moment.utc(server.now.playingSince))).format("mm:ss");

    let embed = {
        color: 0xe84393,
        author: {
            name: `Currently playing:`
        },
        description: `**[${server.now.title}](${server.now.url})**`,
        fields: [
            {
                name: `*Progress*`,
                value: `**${progress}/${server.now.timestamp}**`,
                inline: true,
            },
            {
                name: `*Queue length*`,
                value: `**${server.queue.length} video(s)**`,
                inline: true,
            },
        ],
        footer: {
            text: `Requested by ${server.now.requester} at ${timeNow}`
        }
    }

    return message.channel.send({ embed: embed });
};

module.exports.help = {
    name: "now",
    aliases: ["current"]
}