const Discord = require('discord.js');
const { prefix, token } = require("./config.json");
const fs = require("fs");
const client = new Discord.Client();

const bids = require("./bid.js");

global.servers = {};
var stats;
var stat;
var biddingActive;
var target;
var startmoney = 15000;
var maxprice = 7500;

client.once('ready', () =>
{
    console.log("ready! :)");
    client.user.setActivity(`@shdewz`);
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
            "captains": {

            },
            "sold": {

            }
        };
        stats = JSON.stringify(stat);
        fs.writeFile("stats.json", stats, function (err)
        {
            if (err) console.log("error", err);
        });
        console.log("Stats created succesfully\n" + stat)
    }
})

client.on('message', message =>
{
    biddingActive = bids.biddingActive;
    if (message.author.bot) return;
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

client.login(token);