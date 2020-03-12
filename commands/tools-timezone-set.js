const fs = require("fs");

module.exports.run = async (message, args, client) => {
    if (args.length == 0) return;
    else if (isNaN(args[0]) || !args[0].match(/[\+\-]?[0-9]{1,2}/) || args[0].match(/[0-9]{1,2}/)[0] > 13) return;
    else {
        var zone = args[0].match(/[\+\-]?[0-9]{1,2}/)[0];
        console.log(zone);
        var stat = client.commands.get("loadstats").run(); // load stats
        var exists = false;

        for (var i = 0; i < stat.users.length; i++) {
            if (stat.users[i].discord == message.author.id) {
                stat.users[i].timezone = zone;
                exists = true;
                break;
            }
        }
        if (!exists) {
            var obj = { "discord": message.author.id, "timezone": zone };
            stat.users.push(obj);
        }

        fs.writeFile("stats.json", JSON.stringify(stat), function (err) {
            if (err) return console.log("error", err);
            return message.reply(`succesfully set your timezone to **${zone}**!`);
        });
    }
};

module.exports.help = {
    name: "settime",
    aliases: ["timezone", "setzone"],
    description: "Set your account timezone",
    usage: "settime <UTC offset>",
    example: "settime +2",
    category: "Tools"
}