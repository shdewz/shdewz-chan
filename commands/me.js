const config = require("../config.json");

module.exports.run = async (client, message, args) =>
{
    var id = message.author.id;

    var stat = client.commands.get("loadstats").run(); // load stats

    for (var i = 0; i < stat.captains.length; i++)
    {
        if (stat.captains[i].dc == id)
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
        if (stat.players[i].dc == id)
        {
            return message.channel.send(`**Player name:** \`${stat.players[i].name}\`\n**Pickup line:** ${stat.players[i].story}\n**Sold?** ${stat.players[i].sold}`);
        }
    }
    return message.reply(`your account doesn't seem to be linked yet. Do \`!set <username>\` to link it.`);
};

module.exports.help = {
    name: "me"
}