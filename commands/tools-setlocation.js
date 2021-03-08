const tools = require("../tools.js");

module.exports.run = async (message, args) => {
    if (args.length == 0) return;

    let query = args.join(" ");
    let location_array = await tools.getLocation(query);
    let location = location_array[0];

    let embed = {
        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
        author: {
            name: `${location.label}`,
            icon_url: `https://osu.ppy.sh/images/flags/${location.country_module.global.alpha2}.png`,
        },
        description: `**${message.author.username}**, react with ✅ to set this as your location.`,
    }

    message.channel.send({ embed: embed }).then(async sentMsg => {
        await sentMsg.react("✅");
        const filter = (reaction, user) => { return reaction.emoji.name == "✅" && user.id === message.author.id; };
        const collector = sentMsg.createReactionCollector(filter, { max: 1, time: 20000 });
        collector.on('end', async collected => {
            if (collected.size > 0) {
                let loc = { lat: location.latitude, lon: location.longitude, string: location.label };
                let u = statObj.users.findIndex(user => user.discord == message.author.id);
                if (u == -1) {
                    statObj.users.push({ discord: message.author.id, location: loc });
                }
                else statObj.users[u].location = loc;

                sentMsg.reactions.removeAll();
                embed.description = `Successfully set this as the location for **${message.author.username}**.`
                return sentMsg.edit({ embed: embed });
            }
            else return sentMsg.delete();
        });
        return;
    });


};

module.exports.help = {
    name: "setlocation",
    aliases: ["set_location", "change_location"],
    description: "Set your location to be used in other commands.",
    usage: "setlocation <country/state/city/whatever>",
    category: "Tools"
}