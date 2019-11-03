const Discord = require('discord.js');

const { prefix, token } = require('../../config.json');
const client = new Discord.Client();

function Roll(message, args)
{
    try
    {
        if (args.length >= 2)
        {
            message.channel.send(`${message.author.username} rolls \`${Math.floor(Math.random() * args[1]) + 1}\`!`);
        }
        else
        {
            message.channel.send(`${message.author.username} rolls \`${Math.floor(Math.random() * 100) + 1}\`!`);
        }
    }
    catch(error){
        message.channel.send(`fuck, i have fallen\n\nError code: \`${error}\``);
        console.log(error);
        return;
    }
    
    return;
}
module.exports.roll = Roll;

client.login(token);