const Discord = require('discord.js');

module.exports = {
    name: 'players.list',
    description: 'Lists players.',
    execute(message, args, stat)
    {
        if (args.length >= 1) // single player
        {
            for (var i = 0; i < stat.players.length; i++)
            {
                if (stat.players[i].name.toLowerCase() == args[0].toLowerCase())
                {
                    message.channel.send(`**Player name:** \`${stat.players[i].name}\`\n**Pickup line:**    ${stat.players[i].story}\s**Sold?** ${stat.players[i].sold}`);
                    return;
                }
            }
        }
        else
        {
            if (stat.players.length == 0) return message.channel.send(`Player list is probably empty.`);
            else
            {
                var plrListTextNames = "";
                var plrListTextSold = "";

                for (var i = 0; i < stat.players.length; i++)
                {
                    plrListTextNames += `\`${stat.players[i].name}\`\n`;
                    plrListTextSold += `\`${stat.players[i].sold}\`\n`;
                }

                if (plrListTextNames == "")
                {
                    message.channel.send(`Player list is probably empty.`);
                    return;
                }

                const playerListEmbed = new Discord.RichEmbed()
                    .setColor('#ff007a')
                    .setTitle(`**Current players** (${stat.players.length})`)
                    .addField('*Name*', plrListTextNames, true)
                    .addField('*Sold?*', plrListTextSold, true)
                message.channel.send(playerListEmbed);
                return;
            }
        }
    }
};