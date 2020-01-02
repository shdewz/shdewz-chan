const fs = require("fs");

module.exports.run = async (client, message, args) =>
{
    if (args.length > 0) var id = args[0];
    else var id = message.author.id;

    var found = false;

    var stat = client.commands.get("loadstats").run(); // load stats

    // see if captain
    captain:
    for (var i = 0; i < stat.captains.length; i++)
    {
        if (stat.captains[i].dc == id)
        {
            stat.captains[i].dc = "";

            fs.writeFile("stats.json", JSON.stringify(stat), function (err)
            {
                if (err) return console.log("error", err);
                return console.log("Save successful.");
            });
            found = true;
            message.reply(`succesfully unlinked from ${stat.captains[i].name}.`)
            break captain;
        }
    }

    // see if player
    player:
    for (var i = 0; i < stat.players.length; i++) // go through the list
    {
        if (stat.players[i].dc == id) // see if name exists in players list
        {
            stat.players[i].dc = "";

            fs.writeFile("stats.json", JSON.stringify(stat), function (err)
            {
                if (err) return console.log("error", err);
                return console.log("Save successful.");
            });
            found = true;
            message.reply(`succesfully unlinked from ${stat.players[i].name}.`)
            break player;
        }
    }

    if (!found) message.reply(`${name} nothing to unlink.`);
    return;
}

module.exports.help = {
    name: "unlink"
}