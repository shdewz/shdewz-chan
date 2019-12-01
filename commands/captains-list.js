const Discord = require('discord.js');
const config = require("../config.json");

module.exports = {
    name: 'captains.list',
    description: 'Lists captains.',
    execute(message, args, stat)
    {
        var cptListTextNames = "";
        var cptListTextMoney = "";
        var cptListTextSlaves = "";

        for (var i = 0; i < stat.captains.length; i++)
        {
            cptListTextNames += `\`${stat.captains[i].name}\`\n`;
            cptListTextMoney += `\`${stat.captains[i].money}\`\n`;
            cptListTextSlaves += `\`${stat.captains[i].slaves.length}\`\n`;
        }

        if (cptListTextNames == "")
        {
            message.channel.send(`Captains list is probably empty.`);
            return;
        }

        const captainListEmbed = new Discord.RichEmbed()
            .setColor('#ff007a')
            .setTitle(`**Current captains** (${stat.captains.length})`)
            .addField('*Name*', cptListTextNames, true)
            .addField(`*${config.currency}*`, cptListTextMoney, true)
            .addField('*Slaves*', cptListTextSlaves, true)
        message.channel.send(captainListEmbed);

        return;
    }
};