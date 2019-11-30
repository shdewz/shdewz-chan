const Discord = require('discord.js');
const fs = require("fs");
const client = new Discord.Client();

const bids = require("./bid.js");
const cpt = require("./captains.js");
const plr = require("./players.js");

// global.servers = {}; // will make useful later
var stat;
var biddingActive;
// var target;
var prefix;
var token;
var currency;
var config;
var startmoney;


readConfig(login = true);

client.once('ready', () =>
{
    console.log("- Login succesful.\n\n");
    client.user.setActivity(`with fire`);

    // load stats
    if (fs.existsSync("stats.json"))
    {
        readStats();
    }
    else
    {
        stat = {
            "captains": [
            ],
            "sold": [
            ],
            "unsold": [
            ],
            "players": [
            ]
        };
        writeStats(stat);
        console.log("Stats created succesfully\n" + stat + "\n\n")
    }
})

// receive message in chat

client.on('message', message =>
{
    // get the bid active value or whatever from the other file
    // biddingActive = bids.biddingActive;

    if (message.author.bot) return; // ignore bot messages
    if (!message.content.startsWith(prefix) && !biddingActive) return; // ignore non-commands

    if (message.content.startsWith(prefix))
    {
        // normal commands here

        convertedName = message.author.username.split(' ').join('_'); // replace spaces with underscores
        console.log(`Command ${message.content} issued by: ${convertedName}`);

        const args = message.content.substring(prefix.length).split(" "); // split message to arguments

        // start checking commands
        try // obligatory "error handling"
        {
            switch (args[0].toLowerCase())
            {
                case "bid":
                    return;

                case "captains":
                    cpt.awake(message, args);
                    return;

                case "players":
                    plr.awake(message, args)
                    return;


                case "config":
                    return;

                case "money":
                    if (args.length > 1) convertedName = args[1]; // !money <someone else>
                    for (var i = 0; i < stat.captains.length; i++) // go through the list
                    {
                        if (stat.captains[i].name == convertedName) // see if name exists in captains list
                        {
                            message.channel.send(`\`${convertedName}\` has \`${stat.captains[i].money}\` ${currency}`);
                            return;
                        }
                    }
                    return;

                case "roll":
                    try
                    {
                        if (args.length >= 2 && !isNaN(args[1])) // !roll 69
                        {
                            message.channel.send(`${message.author.username} rolls \`${Math.floor(Math.random() * args[1]) + 1}\`!`);
                        }
                        else // !roll
                        {
                            message.channel.send(`${message.author.username} rolls \`${Math.floor(Math.random() * 100) + 1}\`!`);
                        }
                        return;
                    }
                    catch (error)
                    {
                        console.log(error);
                        message.channel.send(`Something happened!\n\`\`\`\n${error}\n\`\`\``) // send error as message
                    }

                default:
                    message.channel.send(`Unrecognized command \`${message.content}\``)
                    return;
            }
        }
        catch (error)
        {
            console.log(error);
            message.channel.send(`Something happened!\n\`\`\`\n${error}\n\`\`\``) // send error as message
        }

    }
    // check if message is just a number and ignore large numbers (*may* fix images interfering with this)
    else if (!isNaN(message.content) && parseInt(message.content) < 2 * startmoney)
    {
        // bidding functions here

        convertedName = message.author.username.split(' ').join('_'); // replace spaces with underscores
        console.log(convertedName);

        const args = message.content.substring(prefix.length).split(" "); // split message to arguments

    }
    else { return; } // nothing checks out so return

    return;

    // --------------------------------------------------- //
    //            OLD SPAGHETTI STARTS HERE!               //
    // only for making rewrite easier, do not even look :) //
    // --------------------------------------------------- //


    /* OLD CODE
        if (biddingActive == false) // if nothing is happening
        {
            if (!message.content.startsWith(prefix) || message.author.bot) return;

            convertedName = message.author.username.split(' ').join('_');
            console.log(convertedName);

            const args = message.content.substring(prefix.length).split(" ");

            try
            {
                switch (args[0].toLowerCase())
                {
                    case "bid":
                        if (message.member.hasPermission("ADMINISTRATOR") || message.guild.roles.find(role => role.name === "helper") || message.guild.roles.find(role => role.name === "bot testing person"))
                        {
                            if (args.length < 3)
                            {
                                message.channel.send(`too few arguments`);
                                break;
                            }
                            else
                            {
                                if (hasOwnPropertyCI(stat.sold, args[1], "bool"))
                                {
                                    message.channel.send(`Player \`${hasOwnPropertyCI(stat.sold, args[1], "value")}\` already sold to \`${stat.sold[hasOwnPropertyCI(stat.sold, args[1], "value")]}\``);
                                    break;
                                }
                                else if (hasOwnPropertyCI(stat.captains, args[1], "bool"))
                                {
                                    message.channel.send(`Player \`${hasOwnPropertyCI(stat.captains, args[1], "value")}\` cannot be auctioned as they are a captain`);
                                    break;
                                }
                                else
                                {
                                    target = args[1];
                                    maxprice = args[2];
                                    module.exports.stat = stat;
                                    bids.startbid(message, args, target, maxprice);
                                    break;
                                }
                            }
                        }
                        else
                        {
                            message.channel.send(`insufficient permissions`);
                            break;
                        }
                }
            }
            catch (error)
            {
                console.log(error);
                message.channel.send(`something went wrong\n\`\`\`\n${error}\n\`\`\``);
            }

        }
        else if (biddingActive == true) // if bidding is going on
        {
            try
            {
                if (!message.content.startsWith(prefix))
                {
                    if (message.guild.roles.find(role => role.name === "Slave Owner") || message.member.hasPermission("ADMINISTRATOR") || message.guild.roles.find(role => role.name === "bot testing person") || message.guild.roles.find(role => role.name === "helper"))
                    {
                        if (isNaN(message.content)) return;
                        if (message.content.split(" ").length > 1) { message.channel.send(`too many arguments`); return; }
                        else
                        {
                            convertedName = message.author.username.split(' ').join('_');
                            console.log(convertedName);

                            var offer = parseInt(message.content);
                            if (stat.captains[convertedName] <= 4800)
                            {
                                if (offer > 2400)
                                {
                                    message.channel.send(`\`${message.author.username}\`, you can only pay up to \`2400\``);
                                    return;
                                }
                                else if (offer > stat.captains[convertedName])
                                {
                                    message.channel.send(`\`${message.author.username}\`, you only have \`${stat.captains[convertedName]}\``);
                                    return;
                                }
                                else
                                {
                                    module.exports.offer = offer;
                                    bids.joinbid(message);
                                    return;
                                }
                            }
                            else
                            {
                                if (offer > maxprice)
                                {
                                    message.channel.send(`\`${message.author.username}\`, you can only spend up to \`${maxprice}\` on this player`);
                                    return;
                                }
                                else
                                {
                                    module.exports.offer = offer;
                                    bids.joinbid(message);
                                    return;
                                }
                            }
                        }
                    }
                    else
                    {
                        return;
                    }
                }
                else
                {
                    const args = message.content.substring(prefix.length).split(" ");

                    switch (args[0].toLowerCase())
                    {
                        case "abort":
                            if (message.member.hasPermission("ADMINISTRATOR") || message.guild.roles.find(role => role.name === "helper") || message.guild.roles.find(role => role.name === "bot testing person"))
                            {
                                if (!biddingActive)
                                {
                                    message.channel.send(`no active auctions to end`);
                                    break;
                                }
                                else
                                {
                                    bids.abortbid(message, args);
                                    break;
                                }
                            }
                            else
                            {
                                message.channel.send(`insufficient permissions`);
                                break;
                            }

                        case "end":
                            if (message.member.hasPermission("ADMINISTRATOR") || message.guild.roles.find(role => role.name === "helper") || message.guild.roles.find(role => role.name === "bot testing person"))
                            {
                                if (!biddingActive)
                                {
                                    message.channel.send(`no active auctions to end`);
                                    break;
                                }
                                else
                                {
                                    bids.endbid(message, args);
                                    break;
                                }
                            }
                            else
                            {
                                message.channel.send(`insufficient permissions`);
                                break;
                            }
                    }
                }
            }
            catch (error)
            {
                console.log(error);
                message.channel.send(`something went wrong\n\`\`\`\n${error}\n\`\`\``);
            }
        }
    */
})

function readConfig(login)
{
    if (fs.existsSync("config.json"))
    {
        fs.readFile("config.json", "utf-8", function (err, result)
        {
            if (err) console.log("error", err);
            config = JSON.parse(result);

            prefix = config.prefix;
            token = config.token;
            currency = config.currency;
            startmoney = config.startmoney;

            console.log("Config read succesfully\n" + JSON.stringify(config) + "\n\n");

            if (login) { client.login(token); console.log("Logging in...\n\n"); }
        });
    }
    return;
}

function writeConfig()
{
    return;
}

function readStats()
{
    if (fs.existsSync("stats.json"))
    {
        fs.readFile("stats.json", "utf-8", function (err, result)
        {
            if (err) console.log("error", err);
            stat = JSON.parse(result);

            console.log(`Stats read succesfully:\n` + JSON.stringify(stat));
        });
    }
    return;
}

function writeStats(stat)
{
    fs.writeFile("stats.json", JSON.stringify(stat), function (err)
    {
        if (err) console.log("error", err);
    });
    return;
}

module.exports.hasOwnPropertyCI = hasOwnPropertyCI;