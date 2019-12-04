const fs = require("fs");

module.exports = {
    name: 'captains.clear',
    description: 'Clears all captains.',
    execute(message, args, stat)
    {
        if (!message.member.hasPermission("ADMINISTRATOR")) { message.reply(`Insufficient permissions`); return; }

        stat.captains = [];

        fs.writeFile("stats.json", JSON.stringify(stat), function (err)
        {
            if (err) console.log("error", err);

            message.channel.send(`Succesfully cleared all captains.`);
            return;
        });
        return;
    }
};