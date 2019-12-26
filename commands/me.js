const config = require("../config.json");

module.exports.run = async (client, message, args) =>
{
    convertedName = message.member.displayName.split(' ').join('_'); // replace spaces with underscores

    var stat = client.commands.get("loadstats").run(); // load stats

    for (var i = 0; i < stat.captains.length; i++)
    {
        if (stat.captains[i].name.toLowerCase() == convertedName.toLowerCase())
        {
            var cptListTextSlaves = "";
            for (var j = 0; j < stat.captains[i].slaves.length; j++)
            {
                cptListTextSlaves += `\`${stat.captains[i].slaves[j].name}\`, `;
            }

            cptListTextSlaves = cptListTextSlaves.substring(0, cptListTextSlaves.length - 2);

            return message.channel.send(`**Captain:** \`${stat.captains[i].name}\`\n**Funds:** \`${stat.captains[i].money.toLocaleString()} ${config.currency}\`\n**Slaves:** ${cptListTextSlaves} (${stat.captains[i].slaves.length})`);
        }
    }

    for (var i = 0; i < stat.players.length; i++)
    {
        if (stat.players[i].name.toLowerCase() == convertedName.toLowerCase())
        {
            return message.channel.send(`**Player name:** \`${stat.players[i].name}\`\n**Pickup line:**    ${stat.players[i].story}\n**Sold?** ${stat.players[i].sold}`);
        }
    }
    return message.reply("you are not a player/captain.")
};

module.exports.help = {
    name: "me"
}