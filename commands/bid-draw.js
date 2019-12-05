const fs = require("fs");
const config = require("../config.json");
const index = require("../index.js");

module.exports = {
    name: 'bid.draw',
    description: 'Draws a random player to be auctioned.',
    execute(message, args, stat)
    {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`Insufficient permissions.`);
        if (stat.unsold.length == 0) return message.reply(`Unsold list empty.`);

        var rng = Math.floor(Math.random() * stat.unsold.length);

        message.channel.send(`**Chosen player was:** \`${stat.unsold[rng].name}\`\n**Why buy them?** *${stat.unsold[rng].story}*`);
        index.client.commands.get("stats").execute(message, args, stat, stat.unsold[rng].name);
    }
};