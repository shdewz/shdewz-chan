const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const fs = require("fs");
const i = require('./index.js');
const client = new Discord.Client();

var captains = [];
var player;
var price;
var increment = 200;
var min = 100;
var highest;
var target;
var biddingAct = false;
var timer = false;
var endtimeout;
var max_price;
module.exports.biddingActive = biddingAct;

function startBidding(message, args, targetbid, maxprice)
{
    biddingAct = true;
    module.exports.biddingActive = biddingAct;
    captains = [];
    player = args[1];
    price = 1100;
    target = targetbid;
    max_price = maxprice;
    message.channel.send(`\`${player}\` is on sale for \`${price}\` (up to \`${max_price}\`)!\nCaptains can type a larger value to bid.`);
}

function joinBidding(message)
{
    convertedName = message.author.username.split(' ').join('_');
    console.log(convertedName);
    if (i.offer <= (price))
    {
        message.channel.send(`You need to bid more than the current price (\`${price}\`)`);
        return;
    }
    else if (i.offer > (price + increment))
    {
        message.channel.send(`You can't bid more than \`${increment}\` above the current price (\`${price}\`)`);
        return;
    }
    else if (i.offer < (price + min))
    {
        message.channel.send(`You need to bid at least \`${min}\` above the current price (\`${price}\`)`);
        return;
    }
    else
    {
        if (captains.includes(convertedName))
        {
            price = i.offer;
            highest = message.author;
        }
        else
        {
            captains.push(convertedName)
            price = i.offer;
            highest = message.author;
        }
        message.channel.send(`\`${message.author.username}\` bid \`${price}\` on \`${target}\`\n\`${captains.length}\` total participants in the auction.`);

        if (timer) clearTimeout(endtimeout);
        message.channel.send(`\`20 seconds\` remaining`);

        biddingAct = true;
        timer = true;
        module.exports.biddingActive = biddingAct;

        function endtimer()
        {
            endtimeout = setTimeout(function ()
            {
                if (!biddingAct) { return };
                message.channel.send(`Auction on \`${player}\` was won by <@${highest.id}> for a price of \`${price}\`!`);
                i.stat.sold[player] = highest.username;
                i.stat.captains[highest.username] -= price;

                var stats = JSON.stringify(i.stat);
                fs.writeFile("stats.json", stats, function (err)
                {
                    if (err) console.log("error", err);
                });

                console.log(stats);

                captains = [];
                biddingAct = false;
                module.exports.biddingActive = biddingAct;
                return;
            }, 20000);
        }

        endtimer();

        return;
    }
}

function abortBidding(message, args)
{
    message.channel.send(`Auction aborted`);

    captains = [];
    biddingAct = false;
    return;
}

function endBidding(message, args)
{
    if (args[1] == "confirm")
    {
        message.channel.send(`Auction on \`${player}\` was won by \`${highest}\` for a price of \`${price}\`!`);
        i.stat.sold[player] = highest;
        i.stat.captains[highest] -= price;

        var stats = JSON.stringify(i.stat);
        fs.writeFile("stats.json", stats, function (err)
        {
            if (err) console.log("error", err);
        });

        console.log(stats);

        captains = [];
        biddingAct = false;
        return;
    }
    else
    {
        if (captains.length > 1)
        {
            message.channel.send(`More than one (\`${captains.length}\`) people in auction!\nConfirm with \`!end confirm\``);
            return;
        }
        else
        {
            message.channel.send(`Use \`!end confirm\` to confirm`);
            return;
        }
    }
}

function leaveBidding(message, args)
{
    convertedName = message.author.username.split(' ').join('_');
    console.log(convertedName);
    if (captains.includes(convertedName))
    {
        captains.splice(captains.indexOf(convertedName), 1);
        message.channel.send(`\`${message.author.username}\` retreated at \`${price}\`.\`\n${captains.length}\` people in auction.`);
        return;
    }
    else
    {
        message.channel.send(`can't leave auction because you never even joined it`);
        return;
    }
}

function wait(ms)
{
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms)
    {
        end = new Date().getTime();
    }
}

module.exports.startbid = startBidding;
module.exports.joinbid = joinBidding;
module.exports.endbid = endBidding;
module.exports.leavebid = leaveBidding;
module.exports.abortbid = abortBidding;

client.login(token);