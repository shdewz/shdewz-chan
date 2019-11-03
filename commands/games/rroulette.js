const Discord = require('discord.js');

const { prefix, token } = require('../../config.json');
const client = new Discord.Client();

var rroulette_bullets = {};
var rroulette_chambers = {};
var rroulette_shots = {};
var rroulette_random = {};
var rroulette_casualties = {};
var rroulette_active = {};

function rroulette(message, args)
{
    var gid = message.guild.id;
    
    if (args[1] == "start") //?rroulette start
    {
        if (args.length >= 4)
        {
            rroulette_bullets[gid] = args[2];
            rroulette_chambers[gid] = args[3];
        }
        else
        {
            rroulette_bullets[gid] = 1;
            rroulette_chambers[gid] = 6;
        }
        rroulette_shots[gid] = 0;
        rroulette_casualties[gid] = 0;
        rroulette_active[gid] = true;
        const rrouletteEmbed = new Discord.RichEmbed()
            .setColor('#ff007a')
            .setTitle('**Russian Roulette**')
            .setDescription(`A game of revolver clicking has started\nUse \`${prefix}rroulette\` to participate.`)
            .addField('Settings', `- ${rroulette_bullets[gid]} bullets\n- ${rroulette_chambers[gid]} chambers`)
        message.channel.send(rrouletteEmbed);
        return;
    }
    else if (args[1] == "abort") //?rroulette abort
    {
        rroulette_active[gid] = false;
        message.channel.send(`all active games have been aborted`);
        return;
    }
    else
    {
        if (rroulette_active[gid])
        {
            rroulette_random[gid] = Math.floor(Math.random() * rroulette_chambers[gid] - rroulette_shots[gid]) + 1
            rroulette_shots[gid]++;
            if (rroulette_random[gid] <= rroulette_bullets[gid])
            {
                rroulette_casualties[gid]++;
                if (rroulette_casualties[gid] >= rroulette_bullets[gid])
                {
                    message.channel.send(`bang, \`${message.author.username}\` is no longer with us\nno more bullets, the game has ended`);
                    rroulette_active[gid] = false;
                }
                else
                {
                    message.channel.send(`bang, we've lost \`${message.author.username}\`\n${rroulette_chambers[gid] - rroulette_shots[gid]} shots remaining`);
                }
            }
            else
            {
                message.channel.send(`click, \`${message.author.username}\` lives on\n${rroulette_chambers[gid] - rroulette_shots[gid]} shots remaining`);
                if (rroulette_shots[gid] >= rroulette_chambers[gid])
                {
                    message.channel.send(`imagine playing russian roulette with no bullets\nthe game has ended`);
                    rroulette_active[gid] = false;
                }
            }
        }
        else
        {
            message.channel.send(`no game currently active\nstart one using \`${prefix}rroulette start\``);
            return;
        }
        return;
    }
}
module.exports.rr = rroulette;

client.login(token);