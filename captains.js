const Discord = require('discord.js');
const fs = require("fs");

var currency;
var cont;
var stat;
var startmoney;

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

function captains(message, args)
{
    switch (args[1].toLowerCase())
    {
        case "add":
            if (!message.member.hasPermission("ADMINISTRATOR")) { message.channel.send(`Insufficient permissions`); return; }
            if (args.length < 3) { message.channel.send(`Too few arguments.`); return; }

            var captainList = [];
            var cptListText = "";
            var cptListTextMissing = "";
            var nameExists = false;

            for (var i = 2; i < args.length; i++)
            {
                nameExists = false;

                for (var ii = 0; ii < stat.captains.length; ii++) // go through the list
                {
                    if (stat.captains[ii].name == args[i]) // see if name exists in captains list
                    {
                        cptListTextMissing += `\`${args[i]}\`, `;
                        nameExists = true;
                        break;
                    }
                }

                if (!nameExists)
                {
                    captainList.push(args[i]);
                    cptListText += `\`${args[i]}\`, `;
                    var obj = { "name": args[i], "money": startmoney, "slaves": [] };
                    stat.captains.push(obj);
                }
            }

            if (cptListTextMissing != "")
            {
                cptListTextMissing = cptListTextMissing.substring(0, cptListTextMissing.length - 2);
                message.channel.send(`\`${cptListTextMissing}\` already exist(s) as captain(s).`);
            }

            if (cptListText != "")
            {
                cptListText = cptListText.substring(0, cptListText.length - 2);

                writeStats(stat);

                message.channel.send(`Succesfully added ${cptListText} as captain(s).`);
            }

            return;

        case "clear":
            if (!message.member.hasPermission("ADMINISTRATOR")) { message.channel.send(`Insufficient permissions`); return; }

            stat.captains = [];
            message.channel.send(`Succesfully cleared all captains.`);
            return;

        case "remove":
            if (!message.member.hasPermission("ADMINISTRATOR")) { message.channel.send(`Insufficient permissions`); return; }
            if (args.length < 3) { message.channel.send(`Too few arguments.`); return; }

            var cptListText = "";
            var cptListTextMissing = "";
            var index = undefined;

            for (var i = 2; i < args.length; i++)
            {
                var index = stat.captains.findIndex(x => x.name === args[i]);
                if (index !== undefined)
                {
                    stat.captains.splice(index, 1);
                    cptListText += `\`${args[i]}\`, `;
                }
                else
                {
                    cptListTextMissing += `\`${args[i]}\`, `;
                }
            }

            cptListText = cptListText.substring(0, cptListText.length - 2);
            cptListTextMissing = cptListTextMissing.substring(0, cptListTextMissing.length - 2);

            writeStats(stat);

            if (cptListTextMissing != "")
            {
                message.channel.send(`${cptListTextMissing} not found from captains.`);
            }
            if (cptListText != "")
            {
                message.channel.send(`Succesfully removed ${cptListText} from captains.`);
            }
            return;

        case "list":

            var cptListTextNames = "";
            var cptListTextMoney = "";
            var cptListTextSlaves = "";

            for (var i = 0; i < stat.captains.length; i++)
            {
                cptListTextNames += `\`${stat.captains[i].name}\`\n`;
                cptListTextMoney += `\`${stat.captains[i].money}\`\n`;
                cptListTextSlaves += `\`${stat.captains[i].slaves.length}\`\n`;
            }

            if (cptListTextNames == "")
            {
                message.channel.send(`Captains list is probably empty.`);
                return;
            }

            const captainListEmbed = new Discord.RichEmbed()
                .setColor('#ff007a')
                .setTitle(`**Current captains** (${stat.captains.length})`)
                .addField('*Name*', cptListTextNames, true)
                .addField(`*${currency}*`, cptListTextMoney, true)
                .addField('*Slaves*', cptListTextSlaves, true)
            message.channel.send(captainListEmbed);

            return;

        default:
            message.channel.send(`Unrecognized argument \`${args[1]}\`.`);
            return;
    }
}

function loadConfig(cont, message, args)
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

                    if (cont) { captains(message, args); cont = false; }
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