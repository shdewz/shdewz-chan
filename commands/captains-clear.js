const fs = require("fs");

module.exports.run = async (client, message, args) =>
{
    if (!message.member.hasPermission("ADMINISTRATOR")) { message.reply(`Insufficient permissions`); return; }

    var stat = client.commands.get("loadstats").run(); // load stats

    stat.captains = [];

    fs.writeFile("stats.json", JSON.stringify(stat), function (err)
    {
        if (err) console.log("error", err);

        message.channel.send(`Succesfully cleared all captains.`);
        return;
    });
    return;
};

module.exports.help = {
    name: "captains.clear"
}