const fs = require("fs");
const config = require("../config.json");
const Discord = require('discord.js');

module.exports = {
    name: 'bid.join',
    description: 'Bids in auction.',
    execute(message, args, stat)
    {
        var bid = parseInt(args);
        var bidder;
        // check if captain
        for (var i = 0; i < stat.captains.length; i++)
        {
            if (stat.captains[i].name.toLowerCase() == message.member.displayName.toLowerCase())
            {
                bidder = stat.captains[i];
                var found = true;
            }
        }
        if (!found) return message.reply(`\`${message.member.displayName}\` not recognized as a captain.`);
        // check if bid is correct
        if (bid > bidder.money) return message.reply(`you only have ${bidder.money} ${config.currency}.`);
        else if (bid > config.maxprice) return message.reply(`you can only bid up to ${config.maxprice} ${config.currency} on one player.`);
        else if (bid < (price + config.minbid)) return message.reply(`you must bid at least ${config.minbid} ${config.currency} above the current price.`);
        else if (bid > (price + config.maxbid)) return message.reply(`you can only bid ${config.maxbid} ${config.currency} above the current price.`);
        else if ((bid % 100) != 0) return message.reply(`your bid must be divisible by 100.`);

        // bid works
        price = bid;
        highest = bidder.name;
        message.channel.send(`**${message.member.displayName}** bid **${bid}** on **${target}**`);

        // to-do:
        // 20 second timer
        // move player to sold state

        if (bid > 3000) biddingActive = false; // temp disable
        return;
    }
};