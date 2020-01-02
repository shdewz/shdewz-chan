const fs = require("fs");
const config = require("../config.json");

module.exports.run = async (client, message, args) =>
{
    if (!message.member.hasPermission("ADMINISTRATOR")) { message.reply(`Insufficient permissions`); return; }
    if (args.length < 2) { message.reply(`Too few arguments.`); return; }

    var stat = client.commands.get("loadstats").run(); // load stats

    var captainList = [];
    var cptListText = "";
    var cptListTextMissing = "";
    var nameExists = false;
    var startmoney = config.startmoney;

    for (var i = 0; i < stat.captains.length; i++) // go through the list
    {
        if (stat.captains[i].name == args[0]) // see if name exists in players list
        {
            cptListTextMissing += `\`${args[0]}\`, `;
            nameExists = true;
            break;
        }
    }

    if (!nameExists)
    {
        captainList.push(args[0]);
        cptListText += `\`${args[0]}\`, `;
        var obj = { "name": args[0], "money": startmoney, "badges": parseInt(args[1]), "slaves": [], "dc": "" };
        stat.captains.push(obj);
    }

    if (cptListTextMissing != "")
    {
        cptListTextMissing = cptListTextMissing.substring(0, cptListTextMissing.length - 2);
        message.channel.send(`\`${cptListTextMissing}\` already exists as a captain.`);
    }

    if (cptListText != "")
    {
        cptListText = cptListText.substring(0, cptListText.length - 2);

        fs.writeFile("stats.json", JSON.stringify(stat), function (err)
        {
            if (err) console.log("error", err);

            message.channel.send(`Succesfully added ${cptListText} as a captain.`);
            console.log(stat.captains);
            return;
        });
    }
    return;
};

module.exports.help = {
    name: "captains.add"
}