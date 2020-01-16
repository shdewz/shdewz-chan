const fs = require("fs");

module.exports.run = async (client, message, args) => {
    if (args.length > 0) var id = args[0];
    else var id = message.author.id;

    var found = false;

    var stat = client.commands.get("loadstats").run(); // load stats

    // see if captain
    for (var i = 0; i < stat.captains.length; i++) {
        if (stat.captains[i].dc == id) {
            stat.captains[i].dc = "";
            found = true;
            message.reply(`succesfully unlinked from captain ${stat.captains[i].name}.`)
        }
    }

    // see if player
    for (var i = 0; i < stat.players.length; i++) // go through the list
    {
        if (stat.players[i].dc == id) {
            stat.players[i].dc = "";
            found = true;
            message.reply(`succesfully unlinked from player ${stat.players[i].name}.`)
        }
    }

    fs.writeFile("stats.json", JSON.stringify(stat), function (err) {
        if (err) return console.log("error", err);
        return console.log("Save successful.");
    });

    if (!found) message.reply(`nothing to unlink.`);
    return;
}

module.exports.help = {
    name: "unlink"
}