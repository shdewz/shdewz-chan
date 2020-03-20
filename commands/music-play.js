const ytdl = require("ytdl-core");
const search = require("yt-search");
const moment = require("moment");

module.exports.run = async (message, args) => {

    try {
        if (!message.member.voiceChannel) return message.reply("you must be in a voice channel!"); // check if user is in a voice channel
        if (!args[0]) return message.reply("no link!"); // check if a link exists

        // check if argument is a valid link
        var link = "";
        if (args[0].match(/(https?:\/\/)?(www.)?youtu\.?be(.com)?\/(watch\?v=)?.{11}/)) {
            link = args[0];
            var videoid = link.match(/[a-zA-Z0-9_-]{11}/)[0];
            const r = await search(videoid); // search for video
            var video = r.videos[0];
        }
        // try to find a video by searching
        else {
            const r = await search(args.join(" ")); // search for video
            var video = r.videos[0];
            link = video.url;
        }

        // check if server is present in the servers list and add a queue for it
        if (!servers[message.guild.id]) servers[message.guild.id] = { queue: [], queuestats: [], now: {} }

        // assign server variable
        var server = servers[message.guild.id];

        var queue = true;
        if (Object.keys(server.now).length === 0 && server.now.constructor === Object) queue = false;

        // add the video to the queue
        var timeNow = new Date();
        video.timeNow = timeNow;
        video.requester = message.member.displayName;
        server.queue.push(link);
        server.queuestats.push(video);

        if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(connection => {
            play(connection, message);
        });

        // display queue message
        if (queue) {
            let embed = {
                color: message.member.displayColor,
                author: {
                    name: `Added to queue at position ${server.queue.length}:`
                },
                description: `**[${video.title}](${video.url})**`,
                thumbnail: {
                    url: video.thumbnail,
                }
            }
            return message.channel.send({ embed: embed });
        }
        else return;
    }
    catch (err) {
        message.channel.send("error");
        return console.error(err);
    }

};

function play(connection, message) {
    var server = servers[message.guild.id];
    server.now = server.queuestats[0];

    // download the audio of the video
    server.dispatcher = connection.playStream(ytdl(server.queue[0], { filter: "audio", highWaterMark: 1<<25 }));

    var playingSince = new Date();
    server.now.playingSince = playingSince;
    var timeNow = moment.utc(server.now.timeNow).format("HH:mm:ss [UTC]")

    let embed = {
        color: message.member.displayColor,
        author: {
            name: `Started playing:`
        },
        description: `**[${server.now.title}](${server.now.url})**`,
        fields: [
            {
                name: `*Length*`,
                value: `**${server.now.timestamp}**`,
                inline: true,
            },
            {
                name: `*Uploaded*`,
                value: `**${server.now.ago}**`,
                inline: true,
            },
            {
                name: `*Views*`,
                value: `**${server.now.views.toLocaleString()}**`,
                inline: true,
            }
        ],
        thumbnail: {
            url: server.now.thumbnail,
        },
        footer: {
            text: `Requested by ${server.now.requester} at ${timeNow}`
        }
    }

    message.channel.send({ embed: embed });

    // play next after end if in queue
    server.dispatcher.on("end", () => {
        if (server.repeat) play(connection, message);
        else {
            server.queue.shift();
            server.now = {};
            server.queuestats.shift();
            if (server.queue[0]) play(connection, message);
            else {
                delete server.dispatcher;
                server.queue = [];
                return connection.disconnect();
            };
        }
    })
}

module.exports.help = {
    name: "play",
    aliases: ["music", "youtube", "yt"],
    description: "Joins the bot to a voice channel and starts playing a youtube video",
    usage: "play <link/search query>",
    example: "play loli breathing",
    category: "Music"
}