const config = require("../config.json");

module.exports.run = async (client, message, args) =>
{
    var stat = client.commands.get("loadstats").run(); // load stats
    
    if (args.length >= 1) { convertedName = args[0]; return displayMoney(message, args, stat); } // !money <someone else>
    else
    {
        for (var i = 0; i < stat.captains.length; i++)
        {
            if (stat.captains[i].name.toLowerCase() == message.member.displayName.toLowerCase())
            {
                convertedName = message.member.displayName.split(' ').join('_'); // replace spaces with underscores
                return displayMoney(message, args, stat);
            }
        }
        return message.reply(`you are not a captain.`);
    }
};

function displayMoney(message, args, stat)
{
    for (var i = 0; i < stat.captains.length; i++) // go through the list
    {
        if (stat.captains[i].name.toLowerCase() == convertedName.toLowerCase()) // see if name exists in captains list
        {
            message.channel.send(`${message.author} has \`${stat.captains[i].money.toLocaleString()}\` ${config.currency}`);
            return;
        }
    }
    message.reply(`\`${convertedName}\` not found from captains.`);
    return;
}

module.exports.help = {
    name: "money"
}