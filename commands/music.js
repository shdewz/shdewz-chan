const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const { prefix, token } = require('../config.json');
const index = require("../index.js");
const client = new Discord.Client();

// ?play
function Play(connection, message)
{
    try
    {
        var server = servers[message.guild.id];

        server.dispatcher = connection.playStream(ytdl(server.queue[0], { filter: "audioonly" }));

        server.queue.shift();

        server.dispatcher.on("end", function ()
        {
            if (server.queue[0]) Play(connection, message);
            else connection.disconnect();
        });
        return;
    }

    catch (error)
    {
        message.channel.send(`fuck, i have fallen\n\nError code: \`${error}\``);
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
}
module.exports.skip = Skip;

// ?stop
function Stop(message)
{
    if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
    return;
}
module.exports.stop = Stop;

client.login(token);