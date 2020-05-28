const config = require("../config.json");

module.exports.run = async (message, args, client) => {
    let mapfound = false;
    let mapid;
    for (var i = 0; i < statObj.serverstats.length; i++) {
        if (statObj.serverstats[i].id == message.guild.id) {
            for (var j = 0; j < statObj.serverstats[i].channels.length; j++) {
                if (statObj.serverstats[i].channels[j].id == message.channel.id) {
                    if (statObj.serverstats[i].channels[j].content.lastBeatmap) {
                        mapid = statObj.serverstats[i].channels[j].content.lastBeatmap;
                        mapfound = true;
                        break;
                    }
                }
            }
        }
    }
    if (!mapfound) return message.reply("no beatmaps found in the channel.");

    let username;
    if (args.length > 0) {
        username = args.join(" ");
    }
    else {
        for (var i = 0; i < statObj.users.length; i++) {
            if (statObj.users[i].discord == message.author.id) {
                username = statObj.users[i].osu_id;
                var found = true;
                break;
            }
        }
        if (!found) return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${config.prefix}osuset <user>\`.`)
    }

    let embed = await client.commands.get("scores").score(username, mapid, message);
    if (embed.error) return message.channel.send(embed.error);

    return message.channel.send({ embed: embed })
};

module.exports.help = {
    name: "compare",
    aliases: ["c"],
    description: "Show a user's scores on the previous map.",
    usage: "compare [<user>]",
    example: "compare shdewz",
    category: "osu!"
}