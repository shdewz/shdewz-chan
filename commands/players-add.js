const fs = require("fs");

module.exports.run = async (client, message, args) =>
{
    if (!message.member.hasPermission("ADMINISTRATOR")) { message.reply(`Insufficient permissions`); return; }
    if (args.length < 2) { message.reply(`Too few arguments.`); return; }

    var stat = client.commands.get("loadstats").run(); // load stats

    var playerList = [];
    var plrListText = "";
    var plrListTextMissing = "";
    var nameExists = false;
    var story = "unspecified";
    if (args.length > 2)
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
    }

    nameExists = false;

    for (var ii = 0; ii < stat.players.length; ii++) // go through the list
    {
        if (stat.players[ii].name == args[0]) // see if name exists in players list
        {
            plrListTextMissing += `\`${args[0]}\`, `;
            nameExists = true;
            break;
        }
    }

    if (!nameExists)
    {
        playerList.push(args[0]);
        plrListText += `\`${args[0]}\`, `;
        var obj = { "name": args[0], "story": story, "sold": " - ", "badges": parseInt(args[1]) };
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

        fs.writeFile("stats.json", JSON.stringify(stat), function (err)
        {
            if (err) console.log("error", err);

            message.channel.send(`Succesfully added ${plrListText} as player(s).`);
            console.log(stat.players);
            return;
        });
    }
    return;
};

module.exports.help = {
    name: "players.add"
}