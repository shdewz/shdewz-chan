const fs = require("fs");

module.exports.run = async (message, args) => {
    if (args.length == 0) return;
    else if (isNaN(args[0]) || !args[0].match(/[\+\-]?[0-9]{1,2}/) || args[0].match(/[0-9]{1,2}/)[0] > 13) return;
    else {
        var zone = args[0].match(/[\+\-]?[0-9]{1,2}/)[0];
        var exists = false;

        for (var i = 0; i < statObj.users.length; i++) {
            if (statObj.users[i].discord == message.author.id) {
                statObj.users[i].timezone = zone;
                message.reply(`your timezone has been set to ${zone}`);
                exists = true;
                return;
            }
        }
        if (!exists) {
            var obj = { "discord": message.author.id, "timezone": zone };
            statObj.users.push(obj);
            message.reply(`your timezone has been set to ${zone}`);
            return;
        }
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