const fs = require("fs");

module.exports.run = async (client, message, args) =>
{
    if (!message.member.hasPermission("ADMINISTRATOR")) { message.reply(`Insufficient permissions`); return; }

    var stat = client.commands.get("loadstats").run(); // load stats

    stat.players = [];
    stat.sold = [];
    stat.unsold = [];
    for (var i = 0; i < stat.captains.length; i++)
    {
        stat.captains[i].slaves = [];
    }

    fs.writeFile("stats.json", JSON.stringify(stat), function (err)
    {
        if (err) console.log("error", err);

        message.channel.send(`Succesfully cleared all players.`);
        console.log(stat.players);
        return;
    });
    return;
};

module.exports.help = {
    name: "players.clear"
}