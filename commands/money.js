const config = require("../config.json");

module.exports = {
    name: 'money',
    description: `Displays a captain's money.`,
    execute(message, args, stat)
    {
        if (!args && message.member.roles.find(r => r.name === "Captain"))
        {
            convertedName = message.member.displayName.split(' ').join('_'); // replace spaces with underscores
        }
        else if (args.length >= 1) convertedName = args[0]; // !money <someone else>
        else return message.reply(`you are not a captain.`);
        for (var i = 0; i < stat.captains.length; i++) // go through the list
        {
            if (stat.captains[i].name.toLowerCase() == convertedName.toLowerCase()) // see if name exists in captains list
            {
                message.channel.send(`\`${stat.captains[i].name}\` has \`${stat.captains[i].money}\` ${config.currency}`);
                return;
            }
        }
        message.reply(`\`${convertedName}\` not found from captains.`);
        return;
    }
};