const fs = require("fs");

module.exports.run = async (client, message, args) => {
    if (!args) return;
    if (!message.member.roles.some(r => r.name === "Slave")) return;

    var mplink = args[0].replace(/[<>]/g, '');

    // check if link is correct
    if (!/(https?:\/\/)?osu\.ppy\.sh\/(mp|community\/matches)\/[0-9]*\/?/g.test(mplink)) return message.reply(`your mp link is formatted incorrectly.`);

    var stat = client.commands.get("loadstats").run(); // load stats

    // if more players
    if (args.length > 1) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`Insufficient permissions.`);
        args.shift();
        var players = args;

        // go through listed players
        for (var i = 0; i < players.length; i++) {
            // find player in stats
            for (var j = 0; j < stat.players.length; j++) {
                if (stat.players[j].name == players[i]) {
                    // set link
                    stat.players[j].mp = mplink;
                }
            }
        }

        fs.writeFile("stats.json", JSON.stringify(stat), function (err) {
            if (err) return console.log("error", err);
            return console.log("Save successful.");
        });

        return message.reply(`succesfully set mp link for players ${players.join(", ")}.`);
    }
    else {
        var id = message.author.id;

        // check if account linked
        for (var i = 0; i < stat.players.length; i++) {
            if (stat.players[i].dc == id) {
                // set link
                stat.players[i].mp = mplink;

                fs.writeFile("stats.json", JSON.stringify(stat), function (err) {
                    if (err) return console.log("error", err);
                    return console.log("Save successful.");
                });

                return message.reply(`succesfully set mp link.`);
            }
        }
    }

    return message.reply(`your account doesn't seem to be linked yet. Do \`${config.prefix}set <username>\` to link it.`);
}

module.exports.help = {
    name: "mp"
}