const fs = require("fs");

module.exports.run = async (client, message, args) =>
{
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`Insufficient permissions`);

    var stat = client.commands.get("loadstats").run(); // load stats

    for (var i = 0; i < stat.captains.length; i++)
    {
        stat.captains[i].dc = "";
    }

    for (var i = 0; i < stat.players.length; i++)
    {
        stat.players[i].dc = "";
    }

    for (var i = 0; i < stat.unsold.length; i++)
    {
        stat.unsold[i].dc = "";
    }

    fs.writeFile("stats.json", JSON.stringify(stat), function (err)
    {
        if (err) return console.log("error", err);
        return console.log("Save successful.");
    });

    return message.channel.send(`Succesfully cleared discord links.`);;
};

module.exports.help = {
    name: "reset-dc"
}