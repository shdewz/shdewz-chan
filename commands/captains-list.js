const Discord = require('discord.js');
const config = require("../config.json");

module.exports.run = async (client, message, args) =>
{
    var stat = client.commands.get("loadstats").run(); // load stats

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
                    cptListTextSlaves += `\`${stat.captains[i].slaves[j].name.replace(/([_*~])/g, "\\$1")}\`, `;
                }
                cptListTextSlaves = cptListTextSlaves.substring(0, cptListTextSlaves.length - 2);
                message.channel.send(`**Captain:** ${stat.captains[i].name.replace(/([_*~])/g, "\\$1")}\n**Funds:** \`${stat.captains[i].money.toLocaleString()} ${config.currency}\`\n**Slaves:** ${cptListTextSlaves} (${stat.captains[i].slaves.length})`);
                return;
            }
        }
    }
    else // overall stats
    {
        for (var i = 0; i < stat.captains.length; i++)
        {
            cptListTextNames += `${stat.captains[i].name.replace(/([_*~])/g, "\\$1")}\n`;
            cptListTextMoney += `${stat.captains[i].money.toLocaleString()}\n`;
            cptListTextSlaves += `${stat.captains[i].slaves.length}\n`;
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
            .addField(`*${config.currency[0].toUpperCase() + config.currency.substring(1)}*`, cptListTextMoney, true)
            .addField('*Slaves*', cptListTextSlaves, true)
        message.channel.send(captainListEmbed);

        return;
    }
};

module.exports.help = {
    name: "captains.list"
}