const Discord = require('discord.js');

module.exports = {
    name: 'players.sold',
    description: 'Lists sold players.',
    execute(message, args, stat)
    {
        var plrListTextNames = "";
        var plrListTextOwner = "";
        var plrListTextPrice = "";

        for (var i = 0; i < stat.sold.length; i++)
        {
            plrListTextNames += `\`${stat.sold[i].name}\`\n`;
            plrListTextOwner += `\`${stat.sold[i].owner}\`\n`;
            plrListTextPrice += `\`${stat.sold[i].price}\`\n`;
        }

        if (plrListTextNames == "")
        {
            message.channel.send(`Sold list is probably empty.`);
            return;
        }

        const soldListEmbed = new Discord.RichEmbed()
            .setColor('#ff007a')
            .setTitle(`**Sales so far** (${stat.sold.length})`)
            .addField('*Name*', plrListTextNames, true)
            .addField('*Owner*', plrListTextOwner, true)
            .addField('*Sell price*', plrListTextPrice, true)
        message.channel.send(soldListEmbed);

        return;
    }
};