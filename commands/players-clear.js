const fs = require("fs");

module.exports = {
    name: 'players.clear',
    description: 'Clears all players.',
    execute(message, args, stat)
    {
        if (!message.member.hasPermission("ADMINISTRATOR")) { message.reply(`Insufficient permissions`); return; }

        stat.players = [];
        stat.sold = [];
        stat.unsold = [];
        for (var i = 0; i < stat.captains.length; i++)
        {
            stat.captains[i].slaves = [];
        }

        fs.writeFile("stats.json", JSON.stringify(stat), function (err)
        {
            if (err) console.log("error", err);

            message.channel.send(`Succesfully cleared all players.`);
            console.log(stat.players);
            return;
        });
        return;
    }
};