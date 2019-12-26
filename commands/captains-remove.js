const fs = require("fs");

module.exports.run = async (client, message, args) =>
{
    if (!message.member.hasPermission("ADMINISTRATOR")) { message.reply(`Insufficient permissions`); return; } // return if no perms
    if (args.length < 1) { message.reply(`Too few arguments.`); return; } // return if no args

    var stat = client.commands.get("loadstats").run(); // load stats

    // declare some stuff
    var cptListText = "";
    var cptListTextMissing = "";
    var index = undefined;

    for (var i = 0; i < args.length; i++)
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

    fs.writeFile("stats.json", JSON.stringify(stat), function (err)
    {
        if (err) console.log("error", err);

        if (cptListTextMissing != "")
        {
            message.channel.send(`${cptListTextMissing} not found from captains.`);
        }
        if (cptListText != "")
        {
            message.channel.send(`Succesfully removed ${cptListText} from captains.`);
        }
        console.log(stat.captains);
        return;
    });
};

module.exports.help = {
    name: "captains.remove"
}