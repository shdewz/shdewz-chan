const config = require("../config.json");

module.exports = {
    name: 'money',
    description: `Displays a captain's money.`,
    execute(message, args, stat)
    {
        convertedName = message.author.username.split(' ').join('_'); // replace spaces with underscores
        if (args.length >= 1) convertedName = args[0]; // !money <someone else>
        for (var i = 0; i < stat.captains.length; i++) // go through the list
        {
            if (stat.captains[i].name == convertedName) // see if name exists in captains list
            {
                message.channel.send(`\`${convertedName}\` has \`${stat.captains[i].money}\` ${config.currency}`);
                return;
            }
        }
        message.channel.send(`\`${convertedName}\` not found from captains.`);
        return;
    }
};