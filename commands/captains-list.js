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

        if (args.length >= 1) // single stats
        {
            for (var i = 0; i < stat.captains.length; i++)
            {
                if (stat.captains[i].name.toLowerCase() == args[0].toLowerCase())
                {
                    for (var j = 0; j < stat.captains[i].slaves.length; j++)
                    {
                        cptListTextSlaves += `\`${stat.captains[i].slaves[j].name}\`, `;
                    }
                    cptListTextSlaves = cptListTextSlaves.substring(0, cptListTextSlaves.length - 2);
                    message.channel.send(`**Captain:** \`${stat.captains[i].name}\`\n**Funds:** \`${ac(stat.captains[i].money)} ${config.currency}\`\n**Slaves:** ${cptListTextSlaves} (${stat.captains[i].slaves.length})`);
                    return;
                }
            }
        }
        else // overall stats
        {
            for (var i = 0; i < stat.captains.length; i++)
            {
                cptListTextNames += `\`${stat.captains[i].name}\`\n`;
                cptListTextMoney += `\`${ac(stat.captains[i].money)}\`\n`;
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
    }
};

// add comma as thousand separator
function ac(num)
{
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}