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
        for (var ii = 0; ii < stat.players.length; ii++)
        {
            if (stat.players[ii].name.toLowerCase() == args[i].toLowerCase())
            {
                found = true;
                plrListText += `\`${args[i]}\`, `;
                // check if in sold
                for (var j = 0; j < stat.sold.length; j++)
                {
                    if (stat.sold[j].name.toLowerCase() == args[i].toLowerCase())
                    {
                        // remove from captain
                        findCaptains:
                        for (var jj = 0; jj < stat.captains.length; jj++)
                        {
                            for (var k = 0; k < stat.captains[jj].slaves.length; k++)
                            {
                                if (stat.captains[jj].slaves[k].name.toLowerCase() == args[i].toLowerCase())
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
                for (var kk = 0; kk < stat.unsold.length; kk++)
                {
                    if (stat.unsold[kk].name != undefined && stat.unsold[kk].name == args[i])
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