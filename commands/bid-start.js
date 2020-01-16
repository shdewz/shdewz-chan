const fs = require("fs");
const config = require("../config.json");
const Discord = require('discord.js');

var biddingActive = false;

module.exports.run = async (client, message, args) =>
{
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`Insufficient permissions.`);
    if (args.length < 1) return message.reply(`Too few arguments.`);
    if (biddingActive) return message.reply(`Auction already in progress.`);

    var stat = client.commands.get("loadstats").run(); // load stats

    // check if player is a player
    for (var i = 0; i < stat.players.length; i++)
    {
        if (stat.players[i].name.toLowerCase() == args[0].toLowerCase())
        {
            // check if in sold
            for (var j = 0; j < stat.sold.length; j++)
            {
                if (stat.sold[j].name.toLowerCase() == args[0].toLowerCase())
                {
                    return message.reply(`player \`${stat.sold[j].name}\` has already been sold.`);
                }
            }
            return startBid(message, args, stat, stat.players[i]);
        }
    }
    return message.reply(`player \`${args[0]}\` is not set as a player.`);
};

function startBid(message, args, stat, target)
{
    for (var i = 0; i < stat.unsold.length; i++)
    {
        if (stat.unsold[i].name == target.name)
        {
            console.log("removed " + stat.unsold[i].name);
            stat.unsold.splice(i, 1);
            break;
        }
    }

    // add captain ids to allowed bidders
    for (var i = 0; i < stat.captains.length; i++)
    {
        if (stat.captains[i].dc) stat.bidders[i] = stat.captains[i].dc;
    }

    fs.writeFile("stats.json", JSON.stringify(stat), function (err)
    {
        if (err) return console.log("error", err);
        return console.log("Save successful.");
    });

    const bidEmbed = new Discord.RichEmbed()
        .setColor('#ff007a')
        .setDescription(`**${target.name}** is on sale starting at **${config.minbid} ${config.currency}**!\nCaptains may start bidding by typing numbers.`)
    message.channel.send(bidEmbed);

    var price = 0; // set initial price to 0
    biddingActive = true; // set bidding to active

    var bid;

    // set channel topic to show bidding progress
    message.channel.setTopic(`Currently bidding for ${target.name}`);

    // start collecting bids
    const collector = new Discord.MessageCollector(message.channel, m => !isNaN(m.content) && stat.bidders.includes(m.author.id) && !m.author.bot && parseInt(m.content) < 2 * config.startmoney);

    // start a timer to end bidding
    var bidtimer = setTimeout(function ()
    {
        collector.stop();
        message.channel.send(`No one bought ${target.name} 😔`)

        // mark player as yeeted
        for (var i = 0; i < stat.players.length; i++)
        {
            if (stat.players[i].name == target.name)
            {
                stat.players[i].sold = "///"

                var soldObj = { name: target.name, owner: "-", price: "-" };
                stat.sold.push(soldObj);
                break;
            }
        }

        fs.writeFile("stats.json", JSON.stringify(stat), function (err)
        {
            if (err) return console.log("error", err);
            return console.log("Save successful.");
        });

        biddingActive = false;

        return message.channel.setTopic("");
    }, config.timer)

    collector.on('collect', m =>
    {
        bid = parseInt(m.content);
        var result = stat.captains.filter(obj =>
        {
            return obj.dc === m.author.id;
        })
        var bidder = result[0]

        // check if bid is correct
        if (bid > bidder.money) return message.channel.send(`${m.author}, you only have ${bidder.money} ${config.currency}.`);
        else if (bid > config.maxprice) return message.channel.send(`${m.author}, you can only bid up to ${config.maxprice} ${config.currency} on one player.`);
        else if (bid < (price + config.minbid)) return message.channel.send(`${m.author}, you must bid at least ${config.minbid} ${config.currency} above the current price.`);
        else if (bid > (price + config.maxbid)) return message.channel.send(`${m.author}, you can only bid ${config.maxbid} ${config.currency} above the current price.`);
        else if ((bid % 100) != 0) return message.channel.send(`${m.author}, your bid must be divisible by 100.`);

        clearTimeout(bidtimer);
        m.channel.setTopic(`Player on sale: ${target.name} | Current bid: ${bid} ${config.currency} by ${bidder.name}`);
        price = bid;

        console.log(`${bidder.name} bid ${bid} ${config.currency}`);

        // make a new timer
        bidtimer = setTimeout(function ()
        {
            collector.stop();

            // put player to sold
            var soldObj = { name: target.name, owner: bidder.name, price: price };
            stat.sold.push(soldObj);

            // mark player as sold
            for (var i = 0; i < stat.players.length; i++)
            {
                if (stat.players[i].name == target.name)
                {
                    stat.players[i].sold = "YES"
                    break;
                }
            }

            // add sold player to captain and subtract money
            for (var i = 0; i < stat.captains.length; i++)
            {
                if (stat.captains[i].name == bidder.name)
                {
                    var obj = { name: target.name };
                    stat.captains[i].slaves.push(obj);
                    stat.captains[i].money -= price;
                    break;
                }
            }

            message.channel.send(`${target.name} was sold to ${m.author} for ${price} ${config.currency}!`)

            fs.writeFile("stats.json", JSON.stringify(stat), function (err)
            {
                if (err) return console.log("error", err);
                return console.log("Save successful.");
            });

            biddingActive = false;

            return message.channel.setTopic("");

        }, config.timer)
    });

    collector.on('end', collected =>
    {
        console.log(`Collected ${collected.size} items`);
    });

    return;
}

module.exports.help = {
    name: "bid.start"
}