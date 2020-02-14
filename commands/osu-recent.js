const config = require("../config.json");
const osu = require("../osu.js");

module.exports.run = async (message, args, client) => {

    var position;
    var username;

    if (args.includes('-p')) position = args[args.indexOf('-p') + 1] - 1;
    else position = 0;

    if (args.length > 0 && !args[0].match("(-b|-p).*")) username = args.join(" ").match(/^(?:(?! -b)(?! -p).)*/i)[0];
    else {
        var stat = client.commands.get("loadstats").run(); // load stats
        for (var i = 0; i < stat.users.length; i++) {
            if (stat.users[i].discord == message.author.id) {
                username = stat.users[i].osu_id;
                found = true;
                break;
            }
        }
        if (!found) return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${config.prefix}osuset <user>\`.`)
    }

    return osu.recent(username, message, position);
};

module.exports.help = {
    name: "recent",
    aliases: ["r", "rs"]
}