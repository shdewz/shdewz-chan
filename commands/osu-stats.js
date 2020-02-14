const config = require("../config.json");
const osu = require("../osu.js");

module.exports.run = async (message, args, client) => {
    try {
        let username;
        let found;
        if (args.length > 0) username = args.join("_");
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

        return osu.getUser(username, message);
    }
    catch (error) {
        return console.log(error);
    }
};

module.exports.help = {
    name: "osu",
    aliases: ["stats"]
}