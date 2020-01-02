const config = require("../config.json");

module.exports.run = async (client, message, args) =>
{
    var stat = client.commands.get("loadstats").run(); // load stats

    var id = message.author.id;

    for (var i = 0; i < stat.captains.length; i++)
    {
        if (stat.captains[i].dc == id)
        {
            return message.channel.send(`${message.author} has \`${stat.captains[i].money.toLocaleString()}\` ${config.currency}`);
        }
    }
    return message.reply(`you are not a captain or your account isn't linked yet.`);
};

module.exports.help = {
    name: "money"
}