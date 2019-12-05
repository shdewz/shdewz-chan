const fs = require("fs");
const config = require("../config.json");
const Discord = require('discord.js');

var endTimeout;

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
        if (!found) return console.log(`${message.member.displayName} not recognized as a captain.`); // return if not a captain

        // check if bid is correct
        if (bid > bidder.money) return message.reply(`you only have ${bidder.money} ${config.currency}.`);
        else if (bid > config.maxprice) return message.reply(`you can only bid up to ${config.maxprice} ${config.currency} on one player.`);
        else if (bid < (price + config.minbid)) return message.reply(`you must bid at least ${config.minbid} ${config.currency} above the current price.`);
        else if (bid > (price + config.maxbid)) return message.reply(`you can only bid ${config.maxbid} ${config.currency} above the current price.`);
        else if ((bid % 100) != 0) return message.reply(`your bid must be divisible by 100.`);

        // bid works

        clearTimeout(endTimeout); // reset timer if active

        price = bid;
        highest = bidder;
        message.channel.send(`**${message.member.displayName}** bid **${ac(bid)} ${config.currency}** on **${target.name}**`);

        biddingActive = true; // make sure this is true

        function countdown()
        {
            // set timer for 5 seconds
            endTimeout = setTimeout(function ()
            {
                if (!biddingActive) return; // stop if bid has already ended

                // announce winner
                message.channel.send(`Auction on \`${target.name}\` was won by ${message.author} for a price of \`${ac(price)} ${config.currency}\`!`);

                // set player as sold
                var obj = { "name": target.name, "owner": highest.name, "price": price };
                stat.sold.push(obj);

                target.sold = " X "; // mark player as sold

                // add player to captain's stats
                var obj = { "name": target.name, "price": price };
                highest.slaves.push(obj)

                highest.money -= price;

                // save
                fs.writeFile("stats.json", JSON.stringify(stat), function (err)
                {
                    if (err) return console.log("error", err);
                    return console.log("Save successful.");
                });

                biddingActive = false;
                return;

            }, 5000);
        }
        if (biddingActive) countdown(); // double check because
        return;
    }
};

// add comma as thousand separator
function ac(num)
{
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}