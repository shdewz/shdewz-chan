const fs = require("fs");

module.exports.run = async (client, message, args) =>
{
    if (!message.member.hasPermission("ADMINISTRATOR")) { message.reply(`Insufficient permissions`); return; }
    if (args.length < 1) { message.reply(`Too few arguments.`); return; }

    var stat = client.commands.get("loadstats").run(); // load stats

    var plrListText = "";
    var plrListTextMissing = "";
    var found = false;

    for (var i = 0; i < args.length; i++)
    {
        found = false;
        // check if in players
        for (var j = 0; j < stat.players.length; j++)
        {
            if (stat.players[j].name.toLowerCase() == args[i].toLowerCase())
            {
                found = true;
                plrListText += `\`${args[i]}\`, `;
                // check if in sold
                for (var k = 0; k < stat.sold.length; k++)
                {
                    if (stat.sold[k].name.toLowerCase() == args[i].toLowerCase())
                    {
                        // remove from captain
                        findCaptains:
                        for (var l = 0; l < stat.captains.length; l++)
                        {
                            for (var m = 0; m < stat.captains[l].slaves.length; m++)
                            {
                                if (stat.captains[l].slaves[m].name.toLowerCase() == args[i].toLowerCase())
                                {
                                    stat.captains[l].slaves.splice(m, 1);
                                    break findCaptains;
                                }
                            }
                        }
                        stat.sold.splice(k, 1);
                    }
                }
                // remove from unsold if exists
                for (var n = 0; n < stat.unsold.length; n++)
                {
                    if (stat.unsold[n].name != undefined && stat.unsold[n].name == args[i])
                    {
                        stat.unsold.splice(n, 1);
                    }
                }
                stat.players.splice(j, 1);
            }
        }
        if (!found) plrListTextMissing += `\`${args[i]}\`, `;
    }

    plrListText = plrListText.substring(0, plrListText.length - 2);
    plrListTextMissing = plrListTextMissing.substring(0, plrListTextMissing.length - 2);

    fs.writeFile("stats.json", JSON.stringify(stat), function (err)
    {
        if (err) console.log("error", err);

        if (plrListTextMissing != "")
        {
            message.channel.send(`${plrListTextMissing} not found from players.`);
        }
        if (plrListText != "")
        {
            message.channel.send(`Succesfully removed ${plrListText} from players.`);
        }
        return;
    });
    return;
};

module.exports.help = {
    name: "players.remove"
}