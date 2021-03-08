module.exports.run = async (message, args, client) => {
    let user = message.author;
    if (message.mentions.members.first()) user = message.mentions.members.first().user;
    else if (args.length > 0) {
        let query = args.join(" ").toLowerCase();
        try { user = message.guild.members.cache.find(m => m.user.username.toLowerCase().includes(query) || (m.nickname && m.nickname.toLowerCase().includes(query))).user; }
        catch (err) { console.error(err); return message.channel.send(`User **${query}** not found.`); }
    }

    let embed = {
        author: { name: `${user.username}'s avatar` },
        image: { url: user.avatarURL() ? user.avatarURL({ format: "png", size: 512 }) : user.defaultAvatarURL }
    }

    message.channel.send({ embed: embed });
};

module.exports.help = {
    name: "avatar",
    aliases: ["pfp"],
    description: "avatar Yes",
    category: "General"
}