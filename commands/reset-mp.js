const fs = require("fs");

module.exports.run = async (client, message, args) =>
{
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`Insufficient permissions`);

    var stat = client.commands.get("loadstats").run(); // load stats

    for (var i = 0; i < stat.players.length; i++)
    {
        stat.players[i].mp = "";
    }

    fs.writeFile("stats.json", JSON.stringify(stat), function (err)
    {
        if (err) return console.log("error", err);
        return console.log("Save successful.");
    });

    return message.channel.send(`Succesfully cleared mp links.`);;
};

module.exports.help = {
    name: "reset-mp"
}