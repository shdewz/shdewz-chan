const fs = require("fs");
const config = require("../config.json");
const Discord = require('discord.js');

global.price = 0;
global.maxprice;
global.minbid ;
global.maxbid;

global.target; // player to be auctioned
global.captains = []; // array of joined captains
global.highest; // highest bid

module.exports = {
    name: 'bid.start',
    description: 'Starts bidding on a player.',
    execute(message, args, stat)
    {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`Insufficient permissions.`);
        if (args.length < 1) return message.reply(`Too few arguments.`);

        // check if player is a player
        for (var i = 0; i < stat.players.length; i++)
        {
            if (stat.players[i].name.toLowerCase() == args[0].toLowerCase())
            {
                // check if in sold
                for (var j = 0; j < stat.sold.length; j++)
                {
                    if (stat.sold[j].name == args[i])
                    {
                        return message.reply(`Player \`${stat.sold[j].name}\` has already been sold.`);
                    }
                }
                return startBid(message, args, stat, stat.players[i].name);
            }
        }
        return message.reply(`Player \`${args[0]}\` is not set as a player.`);
    }
};

function startBid(message, args, stat, player)
{
    captains = [];
    highest = "";
    target = player;

    const bidEmbed = new Discord.RichEmbed()
        .setColor('#ff007a')
        .setDescription(`**${target}** is on sale starting at **100 ${config.currency}**!\nCaptains may start bidding by typing numbers.`)
    message.channel.send(bidEmbed);

    biddingActive = true;

    return;
}