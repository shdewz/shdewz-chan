const Discord = require('discord.js');
const config = require("../config.json");

module.exports.run = async (client, message, args) =>
{
    var stat = client.commands.get("loadstats").run(); // load stats

    if (args.length >= 1) // single player
    {
        for (var i = 0; i < stat.players.length; i++)
        {
            if (stat.players[i].name.toLowerCase() == args[0].toLowerCase())
            {
                // player is sold
                if (stat.players[i].sold != "   ")
                {
                    for (var j = 0; j < stat.sold.length; j++)
                    {
                        if (stat.sold[j].name == stat.players[i].name)
                        {
                            var owner = stat.sold[j].owner;
                            var price = stat.sold[j].price;
                        }
                    }
                    return message.channel.send(`**Player name:** \`${stat.players[i].name}\`\n**Pickup line:** ${stat.players[i].story}\n**Sold?** Yes, to ${owner} for ${price} ${config.currency}`);
                }
                else
                {
                    return message.channel.send(`**Player name:** \`${stat.players[i].name}\`\n**Pickup line:** ${stat.players[i].story}\n**Sold?** No`);
                }
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
};

module.exports.help = {
    name: "players.list"
}