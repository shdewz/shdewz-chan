const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const { prefix, token } = require('../config.json');
const index = require("../index.js");
const client = new Discord.Client();

// ?play
function Play(connection, message, args)
{
    try
    {
        server.queue.push(args[1]);
        server.queue = server.queue;

        try
        {
            server.dispatcher = connection.playStream(ytdl(server.queue[0], { filter: "audioonly" }));
        }
        catch (error)
        {
            message.channel.send(`\`${error}\``);
            console.log(error);
            server.queue.pop();
            return;
        }

        server.queue.shift();

        server.dispatcher.on("end", function ()
        {
            if (server.queue[0]) Play(connection, message);
            else connection.disconnect(); server.queue = [];
        });
        return;
    }

    catch (error)
    {
        message.channel.send(`\`${error}\``);
        console.log(error);
        return;
    }
}
module.exports.play = Play;

// ?skip
function Skip(message)
{
    var server = servers[message.guild.id];
    if (server.dispatcher) server.dispatcher.end();
    message.channel.send(`Skipped current song\nSongs in queue: ${server.queue.length}\n\nUse \`${prefix}skip\` to skip the current song or \`${prefix}stop\` to stop playing`);
    return;
}
module.exports.skip = Skip;

// ?stop
function Stop(message)
{
    if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect(); server.queue = [];
    return;
}
module.exports.stop = Stop;

client.login(token);