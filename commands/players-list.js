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
                if (stat.players[i].name == args[0])
                {
                    message.channel.send(`**Player name:** \`${stat.players[i].name}\`\n**Reason to be bought:** *${stat.players[i].story}*`);
                    return;
                }
            }
        }
        else
        {
            var plrListTextNames = "";
            var plrListTextStory = "";

            for (var i = 0; i < stat.players.length; i++)
            {
                plrListTextNames += `\`${stat.players[i].name}\`\n`;
                if (stat.players[i].story.length > 30) // shorten too long stories
                {
                    plrListTextStory += `\`${stat.players[i].story.substring(0, 30)}...\`\n`;
                }
                else
                {
                    plrListTextStory += `\`${stat.players[i].story}\`\n`;
                }
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
                .addField('*Why buy me?*', plrListTextStory, true)
            message.channel.send(playerListEmbed);

            console.log(stat.players);
            return;
        }

    }
};