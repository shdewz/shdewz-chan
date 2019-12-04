const config = require("../config.json");
const fetch = require('node-fetch');
const Discord = require('discord.js');
const index = require('../index.js');

module.exports = {
    name: 'stats.random',
    description: `Displays a random user's osu! stats.`,
    execute(message, args, stat, player)
    {
        try
        {
            var rng = Math.floor(Math.random() * stat.players.length);
            convertedName = stat.players[rng].name;

            index.client.commands.get("stats").execute(message, args, stat, convertedName);
        }
        catch (error)
        {
            console.log(error);
            return message.channel.send(`Something happened!\n\`\`\`\n${error}\n\`\`\``); // send error as message
        }
    }
};