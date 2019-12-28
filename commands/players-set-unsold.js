const fs = require("fs");
const config = require("../config.json");

module.exports.run = async (client, message, args) =>
{
    if (!message.member.hasPermission("ADMINISTRATOR")) { message.reply(`Insufficient permissions`); return; }

    var stat = client.commands.get("loadstats").run(); // load stats

    if (args.length == 0)
    {
        stat.unsold = [];
        stat.sold = [];

        // clear sold status
        for (var i = 0; i < stat.players.length; i++)
        {
            stat.players[i].sold = " - ";
            var obj = { name: stat.players[i].name };
            stat.unsold.push(obj);
        }

        // clear captains slaves and money
        for (var i = 0; i < stat.captains.length; i++)
        {
            stat.captains[i].money = config.startmoney;
        }

        fs.writeFile("stats.json", JSON.stringify(stat), function (err)
        {
            if (err) console.log("error", err);
            message.channel.send(`Succesfully set all players as unsold.`);
            return;
        });
    }
    else
    {
        var plrListText = "";
        var plrListTextMissing = "";

        for (var i = 0; i < args.length; i++)
        {
            mainLoop:
            for (var j = 0; j < stat.players.length; j++)
            {
                if (stat.players[j].name == args[i])
                {
                    var obj = { "name": stat.players[j].name };
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

        fs.writeFile("stats.json", JSON.stringify(stat), function (err)
        {
            if (err) console.log("error", err);

            if (plrListTextMissing != "")
            {
                message.channel.send(`${plrListTextMissing} not recognized as a player.`);
            }
            if (plrListText != "")
            {
                message.channel.send(`Succesfully set ${plrListText} as unsold.`);
            }
            console.log(stat);
            return;
        });
    }
    return;
};

module.exports.help = {
    name: "players.set-unsold"
}