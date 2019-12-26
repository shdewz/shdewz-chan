const Discord = require('discord.js');

module.exports.run = async (client, message, args) =>
{
    var stat = client.commands.get("loadstats").run(); // load stats

    var plrListTextNames = "";
    var plrListTextOwner = "";
    var plrListTextPrice = "";

    for (var i = 0; i < stat.sold.length; i++)
    {
        plrListTextNames += `\`${stat.sold[i].name}\`\n`;
        plrListTextOwner += `\`${stat.sold[i].owner}\`\n`;
        plrListTextPrice += `\`${stat.sold[i].price.toLocaleString()}\`\n`;
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
};

module.exports.help = {
    name: "players.sold"
}