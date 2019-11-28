const Discord = require('discord.js');
const fs = require("fs");
const client = new Discord.Client();

const bids = require("./bid.js");

// global.servers = {}; // will make useful later
var stats;
var stat;
var biddingActive;
var target;
var prefix;
var token;
var currency;

// change these according to rules
var startmoney = 15000;
var maxprice = 7500;

function loadConfig()
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

            console.log("Config read succesfully\n" + JSON.stringify(config))
            client.login(token);
        });
    }
}
loadConfig();

client.once('ready', () =>
{
    console.log("ready! :)");
    client.user.setActivity(`test time`);

    // load stats
    if (fs.existsSync("stats.json"))
    {
        fs.readFile("stats.json", "utf-8", function (err, result)
        {
            if (err) console.log("error", err);
            stats = result;

            stat = JSON.parse(stats);
            console.log("Stats read succesfully\n" + JSON.stringify(stat))
        });
    }
    else
    {
        stat = {
            "captains": [
            ],
            "sold": [
            ],
            "players": [
            ]
        };
        stats = JSON.stringify(stat);
        fs.writeFile("stats.json", stats, function (err)
        {
            if (err) console.log("error", err);
        });
        console.log("Stats created succesfully\n" + stat)
    }
})

// receive message in chat

client.on('message', message =>
{
    // get the bid active value or whatever from the other file
    biddingActive = bids.biddingActive;

    if (message.author.bot) return; // ignore bot messages

    if (!message.content.startsWith(prefix) && !biddingActive) return; // ignore non-commands

    if (message.content.startsWith(prefix))
    {
        // normal commands here

        convertedName = message.author.username.split(' ').join('_'); // replace spaces with underscores
        console.log(convertedName);

        const args = message.content.substring(prefix.length).split(" "); // split message to arguments

        // start checking commands
        try // obligatory "error handling"
        {
            switch (args[0].toLowerCase())
            {
                case "bid":
                    return;

                case "captains":
                    if (args.length < 2) { message.channel.send(`Too few arguments.`); return; }

                    switch (args[1].toLowerCase())
                    {
                        case "set":
                            if (!message.member.hasPermission("ADMINISTRATOR"))
                            {
                                message.channel.send(`Insufficient permissions`);
                                return;
                            }
                            if (args.length < 3)
                            {
                                message.channel.send(`Too few arguments.`);
                                return;
                            }

                            var captainList = [];
                            var cptListText = "";
                            stat.captains = [];

                            for (var i = 2; i < args.length; i++)
                            {
                                captainList.push(args[i]);
                                cptListText += `\`${args[i]}\`, `

                                // var cptindex = stat.captains.length;

                                var obj = { "name": args[i], "money": startmoney, "slaves": [] }
                                stat.captains.push(obj);
                            }

                            cptListText = cptListText.substring(0, cptListText.length - 2);

                            var stats = JSON.stringify(stat);
                            fs.writeFile("stats.json", stats, function (err)
                            {
                                if (err) console.log("error", err);
                            });

                            console.log(captainList);
                            console.log(stat);

                            message.channel.send(`Succesfully set ${cptListText} as captain(s).`);

                            return;

                        case "add":
                            return;

                        case "list":

                            var cptListTextNames = "";
                            var cptListTextMoney = "";

                            for (var i = 0; i < stat.captains.length; i++)
                            {
                                cptListTextNames += `\`${stat.captains[i].name}\`\n`;
                                cptListTextMoney += `\`${stat.captains[i].money}\` ${currency}\n`;
                            }

                            const captainListEmbed = new Discord.RichEmbed()
                                .setColor('#ff007a')
                                .setTitle(`**Current captains** (${stat.captains.length})`)
                                .addField('*Name*', cptListTextNames, true)
                                .addField('*Money*', cptListTextMoney, true)
                            message.channel.send(captainListEmbed);

                            return;

                        default:
                            message.channel.send(`Unrecognized argument \`${args[1]}\`.`);
                            return;
                    }

                case "players":
                    return;

                case "sold":
                    return;

                case "config":
                    return;

                case "money":
                    for (var i = 0; i < stat.captains.length; i++)
                    {
                        if (args.length > 1) convertedName = args[1];
                        // see if name exists in captains list
                        if (stat.captains[i].name == convertedName)
                        {
                            message.channel.send(`\`${convertedName}\` has \`${stat.captains[i].money}\` ${currency}`);
                            return;
                        }
                    }
                    message.channel.send(`\`${message.author.username}\` not recognized as a captain.`);
                    return;

                case "roll":
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
    // check if message is just a number and ignore large numbers (may fix images interfering with this)
    else if (!isNaN(message.content) && parseInt(message.content) < 2 * startmoney)
    {
        // bidding functions here

        convertedName = message.author.username.split(' ').join('_'); // replace spaces with underscores
        console.log(convertedName);

        const args = message.content.substring(prefix.length).split(" "); // split message to arguments

    }
    else { return; } // nothing checks out so return

    return;

    // -------------------------- //
    // OLD SPAGHETTI STARTS HERE! //
    // -------------------------- //



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

                case "setcaptains":
                    if (message.member.hasPermission("ADMINISTRATOR") || message.guild.roles.find(role => role.name === "helper") || message.guild.roles.find(role => role.name === "bot testing person"))
                    {
                        if (args.length < 2)
                        {
                            message.channel.send(`too few arguments`);
                            break;
                        }
                        else
                        {
                            var captainList = [];
                            var cptListText = "";
                            stat.captains = {};

                            for (var i = 1; i < args.length; i++)
                            {
                                captainList.push(args[i]);
                                stat.captains[args[i]] = startmoney;
                                cptListText += `\`${args[i]}\`, `
                            }

                            cptListText = cptListText.substring(0, cptListText.length - 2);

                            var stats = JSON.stringify(stat);
                            fs.writeFile("stats.json", stats, function (err)
                            {
                                if (err) console.log("error", err);
                            });

                            console.log(captainList);
                            console.log(stat);

                            message.channel.send(`Set ${cptListText} as captain(s).`);

                            break;
                        }
                    }
                    else
                    {
                        message.channel.send(`insufficient permissions`);
                        break;
                    }

                case "addcaptains":
                    if (message.member.hasPermission("ADMINISTRATOR") || message.guild.roles.find(role => role.name === "helper") || message.guild.roles.find(role => role.name === "bot testing person"))
                    {
                        if (args.length < 2)
                        {
                            message.channel.send(`too few arguments`);
                            break;
                        }
                        else
                        {
                            var captainList = [];
                            var cptListText = "";

                            for (var i = 1; i < args.length; i++)
                            {
                                captainList.push(args[i]);
                                stat.captains[args[i]] = startmoney;
                                cptListText += `\`${args[i]}\`, `
                            }

                            cptListText = cptListText.substring(0, cptListText.length - 2);

                            var stats = JSON.stringify(stat);
                            fs.writeFile("stats.json", stats, function (err)
                            {
                                if (err) console.log("error", err);
                            });

                            console.log(captainList);
                            console.log(stat);

                            message.channel.send(`Added ${cptListText} as captain(s).`);

                            break;
                        }
                    }
                    else
                    {
                        message.channel.send(`insufficient permissions`);
                        break;
                    }

                case "listcaptains":
                    if (message.member.hasPermission("ADMINISTRATOR") || message.guild.roles.find(role => role.name === "helper") || message.guild.roles.find(role => role.name === "bot testing person"))
                    {
                        var keys = Object.keys(stat.captains);
                        var captainsText = "**Current captains:**\n\n";
                        if (keys.length == 0)
                        {
                            captainsText += "None";
                        }
                        else
                        {
                            for (var i = 0; i < keys.length; i++)
                            {
                                captainsText += `\`${keys[i]}\` (\`${stat.captains[keys[i]]}\` money)\n`;
                            }
                        }

                        message.channel.send(captainsText);
                        console.log(stat);

                        break;
                    }
                    else
                    {
                        message.channel.send(`insufficient permissions`);
                        break;
                    }

                case "clearsold":
                    if (message.member.hasPermission("ADMINISTRATOR") || message.guild.roles.find(role => role.name === "helper") || message.guild.roles.find(role => role.name === "bot testing person"))
                    {
                        stat.sold = {};
                        Object.keys(stat.captains).forEach(v => stat.captains[v] = startmoney);
                        message.channel.send(`cleared sold list and reset everyone to full money`);

                        var stats = JSON.stringify(stat);
                        fs.writeFile("stats.json", stats, function (err)
                        {
                            if (err) console.log("error", err);
                        });

                        console.log(stat);
                        break;
                    }
                    else
                    {
                        message.channel.send(`insufficient permissions`);
                        break;
                    }

                case "money":
                    if (message.guild.roles.find(role => role.name === "Slave Owner") || message.member.hasPermission("ADMINISTRATOR") || message.guild.roles.find(role => role.name === "helper"))
                    {
                        if (stat.captains[convertedName] == null)
                        {
                            message.channel.send(`\`${message.author.username}\` not found in captains list, ping shdewz if this is an issue`);
                            break;
                        }
                        else
                        {
                            message.channel.send(`\`${message.author.username}\` has \`${stat.captains[convertedName]}\` money`);
                            console.log(stat);
                            break;
                        }

                    }
                    else
                    {
                        message.channel.send(`insufficient permissions`);
                        break;
                    }

                case "sold":
                    var keys = Object.keys(stat.sold);
                    var soldText = "**Slave sales so far:**\n\n";
                    if (keys.length == 0)
                    {
                        soldText += "None";
                    }
                    else
                    {
                        for (var i = 0; i < keys.length; i++)
                        {
                            soldText += `\`${keys[i]}\` sold to \`${stat.sold[keys[i]]}\`\n`;
                        }
                    }

                    message.channel.send(soldText);
                    console.log(stat);
                    break;

                case "roll":
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
                    catch (error)
                    {
                        message.channel.send(`dead\n\nError code: \`${error}\``);
                        console.log(error);
                        break;
                    }
                    break;

                default:
                    message.channel.send(`wrong command`);
                    break;
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

                    case "money":
                        if (message.guild.roles.find(role => role.name === "Slave Owner") || message.member.hasPermission("ADMINISTRATOR") || message.guild.roles.find(role => role.name === "helper") || message.guild.roles.find(role => role.name === "bot testing person"))
                        {
                            message.channel.send(`\`${message.author.username}\` has \`${stat.captains[convertedName]}\` money`);
                            break;
                        }
                        else
                        {
                            message.channel.send(`insufficient permissions`);
                            break;
                        }

                    case "leave":
                        if (message.guild.roles.find(role => role.name === "Slave Owner") || message.member.hasPermission("ADMINISTRATOR") || message.guild.roles.find(role => role.name === "bot testing person") || message.guild.roles.find(role => role.name === "helper"))
                        {
                            bids.leavebid(message, args);
                            break;
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
})

function hasOwnPropertyCI(obj, property, returnType)
{
    var props = [];
    for (var i in obj) if (obj.hasOwnProperty(i)) props.push(i);
    var prop;
    while (prop = props.pop())
    {
        if (prop.toLowerCase() === property.toLowerCase())
        {
            if (returnType == "bool")
            {
                return true;
            }
            else if (returnType == "value")
            {
                return prop;
            }
        }
    }
    return false;
}

module.exports.hasOwnPropertyCI = hasOwnPropertyCI;