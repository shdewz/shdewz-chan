module.exports.run = async (message, args) => {
    if (args.length == 0) return;
    if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply("insufficient permissions.");
    let server = statObj.serverstats.findIndex(s => s.id == message.guild.id);
    let prefix = args.join(" ").substring(0, 20);

    if (server === -1) statObj.serverstats.push({ id: message.guild.id, channels: [], prefix: prefix });
    else statObj.serverstats[server].prefix = prefix;

    let embed = {
        author: {
            name: `Server prefix changed to '${prefix}'`,
            icon_url: message.guild.iconURL({ format: "png", size: 64 }),
        }
    }

    message.channel.send({ embed: embed });
};

module.exports.help = {
    name: "prefix",
    description: "Change the server prefix",
    category: "General"
}