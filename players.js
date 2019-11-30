const Discord = require('discord.js');
const fs = require("fs");

var cont;
var stat;

function awake(message, args)
{
    try // obligatory "error handling"
    {
        if (args.length < 2) { message.channel.send(`Too few arguments.`); return; }

        loadConfig(cont = true, message, args);
    }
    catch (error)
    {
        console.log(error);
        message.channel.send(`Something happened!\n\`\`\`\n${error}\n\`\`\``) // send error as message
    }
}

function players(message, args)
{
    if (args.length < 2) { message.channel.send(`Too few arguments.`); return; }

    switch (args[1].toLowerCase())
    {
        case "add":
            if (!message.member.hasPermission("ADMINISTRATOR")) { message.channel.send(`Insufficient permissions`); return; }
            if (args.length < 3) { message.channel.send(`Too few arguments.`); return; }

            var playerList = [];
            var plrListText = "";
            var plrListTextMissing = "";
            var nameExists = false;
            var story = "unspecified";
            if (args.length > 3)
            {
                try
                {
                    story = message.content.match(/""([^""]+)""/)[1];
                }
                catch (error)
                {
                    console.log(error);
                    story = "unspecified/error";
                }

            };

            nameExists = false;

            for (var ii = 0; ii < stat.players.length; ii++) // go through the list
            {
                if (stat.players[ii].name == args[2]) // see if name exists in players list
                {
                    plrListTextMissing += `\`${args[2]}\`, `;
                    nameExists = true;
                    break;
                }
            }

            if (!nameExists)
            {
                playerList.push(args[2]);
                plrListText += `\`${args[2]}\`, `;
                var obj = { "name": args[2], "story": story };
                stat.players.push(obj);
            }

            if (plrListTextMissing != "")
            {
                plrListTextMissing = plrListTextMissing.substring(0, plrListTextMissing.length - 2);
                message.channel.send(`\`${plrListTextMissing}\` already exist(s) as player(s).`);
            }

            if (plrListText != "")
            {
                plrListText = plrListText.substring(0, plrListText.length - 2);

                var stats = JSON.stringify(stat);
                fs.writeFile("stats.json", stats, function (err)
                {
                    if (err) console.log("error", err);
                });

                message.channel.send(`Succesfully added ${plrListText} as player(s).`);
            }
            return;

        case "clear":
            if (!message.member.hasPermission("ADMINISTRATOR")) { message.channel.send(`Insufficient permissions`); return; }
            stat.players = [];
            stat.sold = [];
            stat.unsold = [];
            for (var i = 0; i < stat.captains.length; i++)
            {
                stat.captains[i].slaves = [];
            }
            writeStats(stat);
            message.channel.send(`Succesfully cleared all players.`);
            return;

        case "remove":
            if (!message.member.hasPermission("ADMINISTRATOR")) { message.channel.send(`Insufficient permissions`); return; }
            if (args.length < 3) { message.channel.send(`Too few arguments.`); return; }

            var plrListText = "";
            var plrListTextMissing = "";
            var found = false;

            mainLoop:
            for (var i = 2; i < args.length; i++)
            {
                found = false;
                // check if in players
                for (var ii = 0; ii < stat.players.length; ii++)
                {
                    if (stat.players[ii].name == args[i])
                    {
                        found = true;
                        plrListText += `\`${args[i]}\`, `;
                        // check if in sold
                        for (var j = 0; j < stat.sold.length; j++)
                        {
                            if (stat.sold[j].name == args[i])
                            {
                                // remove from captain
                                findCaptains:
                                for (var jj = 0; jj < stat.captains.length; jj++)
                                {
                                    for (var k = 0; k < stat.captains[jj].slaves.length; k++)
                                    {
                                        if (stat.captains[jj].slaves[k].name == args[i])
                                        {
                                            stat.captains[jj].slaves.splice(k, 1);
                                            break findCaptains;
                                        }
                                    }
                                }
                                stat.sold.splice(j, 1);
                            }
                        }
                        // remove from unsold if exists
                        for (var kk = 0; kk < stat.sold.length; kk++)
                        {
                            if (stat.unsold[kk].name == args[i])
                            {
                                stat.unsold.splice(kk, 1);
                            }
                        }
                        stat.players.splice(ii, 1);
                    }
                }
                if (!found) plrListTextMissing += `\`${args[i]}\`, `;
            }

            plrListText = plrListText.substring(0, plrListText.length - 2);
            plrListTextMissing = plrListTextMissing.substring(0, plrListTextMissing.length - 2);

            writeStats(stat);

            if (plrListTextMissing != "")
            {
                message.channel.send(`${plrListTextMissing} not found from players.`);
            }
            if (plrListText != "")
            {
                message.channel.send(`Succesfully removed ${plrListText} from players.`);
            }

            return;

        case "list":
            var plrListTextNames = "";
            var plrListTextStory = "";

            for (var i = 0; i < stat.players.length; i++)
            {
                plrListTextNames += `\`${stat.players[i].name}\`\n`;
                plrListTextStory += `\`${stat.players[i].story}\`\n`;
            }

            if (plrListTextNames == "")
            {
                message.channel.send(`Player list is probably empty.`);
                return;
            }

            const playerListEmbed = new Discord.RichEmbed()
                .setColor('#ff007a')
                .setTitle(`**Current players** (${stat.players.length})`)
                .addField('*Name*', plrListTextNames, true)
                .addField('*Why buy me?*', plrListTextStory, true)
            message.channel.send(playerListEmbed);

            return;

        case "sold":
            var plrListTextNames = "";
            var plrListTextOwner = "";
            var plrListTextPrice = "";

            for (var i = 0; i < stat.sold.length; i++)
            {
                plrListTextNames += `\`${stat.sold[i].name}\`\n`;
                plrListTextOwner += `\`${stat.sold[i].owner}\`\n`;
                plrListTextPrice += `\`${stat.sold[i].price}\`\n`;
            }

            if (plrListTextNames == "")
            {
                message.channel.send(`Sold list is probably empty.`);
                return;
            }

            const soldListEmbed = new Discord.RichEmbed()
                .setColor('#ff007a')
                .setTitle(`**Sales so far** (${stat.sold.length})`)
                .addField('*Name*', plrListTextNames, true)
                .addField('*Owner*', plrListTextOwner, true)
                .addField('*Sell price*', plrListTextPrice, true)
            message.channel.send(soldListEmbed);

            return;

        case "set-unsold":
            if (!message.member.hasPermission("ADMINISTRATOR")) { message.channel.send(`Insufficient permissions`); return; }
            if (args.length < 3)
            {
                stat.unsold = stat.players;
                stat.sold = [];
                var stats = JSON.stringify(stat);
                fs.writeFile("stats.json", stats, function (err)
                {
                    if (err) console.log("error", err);
                });
                message.channel.send(`Succesfully set all players as unsold.`);
            }
            else
            {
                var plrListText = "";
                var plrListTextMissing = "";

                mainLoop:
                for (var i = 2; i < args.length; i++)
                {
                    for (var j = 0; j < stat.players.length; j++)
                    {
                        if (stat.players[j].name == args[i])
                        {
                            var obj = { "name": stat.players[j].name, "story": stat.players[j].story };
                            stat.unsold.push(obj);
                            plrListText += `\`${args[i]}\`, `;

                            // remove from sold if exists
                            for (var k = 0; k < stat.sold.length; k++)
                            {
                                if (stat.sold[k].name == args[i])
                                {
                                    // remove from captains
                                    for (var l = 0; l < stat.captains.length; l++)
                                    {
                                        if (stat.captains[l].name == stat.sold[k].owner)
                                        {
                                            for (var m = 0; m < stat.captains[l].slaves.length; m++)
                                            {
                                                if (stat.captains[l].slaves[m].name == args[i])
                                                {
                                                    stat.captains[l].slaves.splice(m, 1);

                                                    stat.sold.splice(k, 1);
                                                    break mainLoop;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            stat.sold.splice(k, 1);
                            break mainLoop;
                        }
                    }
                }

                plrListText = plrListText.substring(0, plrListText.length - 2);
                plrListTextMissing = plrListTextMissing.substring(0, plrListTextMissing.length - 2);

                writeStats(stat);

                if (plrListTextMissing != "")
                {
                    message.channel.send(`${plrListTextMissing} not recognized as a player.`);
                }
                if (plrListText != "")
                {
                    message.channel.send(`Succesfully set ${plrListText} as unsold.`);
                }
                return;
            }
            return;

        default:
            message.channel.send(`Unrecognized argument \`${args[1]}\`.`);
            return;
    }
}

function loadConfig(cont, message, args, soldbool)
{
    if (fs.existsSync("config.json"))
    {
        fs.readFile("config.json", "utf-8", function (err, result)
        {
            if (err) console.log("error", err);
            config = JSON.parse(result);

            currency = config.currency;
            startmoney = config.startmoney;

            if (fs.existsSync("stats.json"))
            {
                fs.readFile("stats.json", "utf-8", function (err, result)
                {
                    if (err) console.log("error", err);
                    stat = JSON.parse(result);

                    if (cont) { players(message, args); cont = false; }
                });
            }
        });
    }
}

function writeStats(stat)
{
    fs.writeFile("stats.json", JSON.stringify(stat), function (err)
    {
        if (err) console.log("error", err);
    });
    return;
}

module.exports.awake = awake;