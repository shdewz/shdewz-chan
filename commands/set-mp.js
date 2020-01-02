const fs = require("fs");

module.exports.run = async (client, message, args) =>
{
    if (!args) return;
    if (!message.member.roles.some(r => r.name === "Slave")) return;

    var mplink = args[0].replace(/[<>]/g, '');

    // check if link is correct
    if (!/(https?:\/\/)?osu\.ppy\.sh\/(mp|community\/matches)\/[0-9]*\/?/g.test(mplink)) return message.reply(`your mp link is formatted incorrectly.`);
    
    var id = message.author.id;

    var stat = client.commands.get("loadstats").run(); // load stats

    // check if account linked
    for (var i = 0; i < stat.players.length; i++)
    {
        if (stat.players[i].dc == id)
        {
            // set link
            stat.players[i].mp = mplink;

            fs.writeFile("stats.json", JSON.stringify(stat), function (err)
            {
                if (err) return console.log("error", err);
                return console.log("Save successful.");
            });

            return message.reply(`succesfully set mp link.`);
        }
    }

    return message.reply(`your account doesn't seem to be linked yet. Do \`${config.prefix}set <username>\` to link it.`);
}

module.exports.help = {
    name: "mp"
}