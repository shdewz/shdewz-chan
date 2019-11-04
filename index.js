const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

const rr = require("./commands/games/rroulette.js");
const roll = require("./commands/games/roll.js");
const help = require("./commands/help.js");
const music = require("./commands/music.js");
const osustats = require("./commands/osustats.js");
const cardgame = require("./commands/games/cardgame.js");

global.servers = {};

client.once('ready', () =>
{
    console.log("ready! :)");
    // client.channels.get('639878340806967298').send('fbi open up shdewz-chan is coming in')
    client.user.setActivity(`${prefix}help`);
})

client.on('message', message =>
{
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    //const args = message.content.slice(prefix.length).split(' ');
    const args = message.content.substring(prefix.length).split(" ");

    switch (args[0].toLowerCase())
    {
        case "help":
            if (args[1])
            {
                switch (args[1].toLowerCase())
                {
                    case "osu":
                        help.osuhelp(message, args);
                        break;

                    default:
                        message.channel.send(`Unrecognized category.\nUse \`${prefix}help\` for a list of commands.`);
                        break;
                }
            }
            else
            {
                help.mainhelp(message, args);
                break;
            }
            break;

        case "roll":
            roll.roll(message, args);
            break;

        case "rroulette":
            rr.rr(message, args);
            break;

        case "play":
            if (!args[1])
            {
                message.channel.send("Include a link with the command");
                return;
            }
            if (!message.member.voiceChannel)
            {
                message.channel.send("Join a voice channel first");
                return;
            }
            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            };

            var server = servers[message.guild.id];

            if (server.queue[0] || server.dispatcher)
            {
                server.queue.push(args[1]);
                message.channel.send(`Added song to queue\nSongs in queue: ${server.queue.length}\n\nUse \`${prefix}skip\` to skip the current song or \`${prefix}stop\` to stop playing`);
            }
            else
            {
                server.queue.push(args[1]);
                message.channel.send(`Started playing song`);
            }

            if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function (connection)
            {
                music.play(connection, message);
            });
            break;

        case "skip":
            music.skip(message);
            break;

        case "stop":
            music.stop(message);
            break;

        case "osu":
            switch (args[1].toLowerCase())
            {
                case "stats":
                    osustats.stats(message, args);
                    break;

                default:
                    message.channel.send(`Unrecognized argument.\nUse \`${prefix}help\` for a list of commands.`);
                    break;

            }
            break;
        /*
        case "cards":
            cardgame.cards(message, args);
            break;*/

        default:
            message.channel.send(`Unrecognized command.\nUse \`${prefix}help\` for a list of commands.`);
    }
})

client.login(token);