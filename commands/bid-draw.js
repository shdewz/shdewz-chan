const fs = require("fs");
const config = require("../config.json");
const index = require("../index.js");

module.exports.run = async (client, message, args) =>
{
    if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`Insufficient permissions.`);

    var stat = client.commands.get("loadstats").run(); // load stats
    if (stat.unsold.length == 0) return message.reply(`Unsold list empty.`);

    var rng = Math.floor(Math.random() * stat.unsold.length);

    message.channel.send(`**Chosen player was:** \`${stat.unsold[rng].name}\``);
    client.commands.get("stats").run(client, message, args, stat.unsold[rng].name);
};

module.exports.help = {
    name: "bid.draw"
}