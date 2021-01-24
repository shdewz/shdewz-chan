module.exports.run = async (message, args, client) => {
    let id = message.mentions.members.first() ? message.mentions.members.first().id : message.author.id;
    let user = gacha.users.find(u => u.id == id);
    let userobj = client.users.cache.get(id);

    let embed = {
        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
        author: {
            name: userobj.username,
            icon_url: userobj.avatarURL()
        },
        fields: [
            {
                name: "Account info",
                value: "Balance\nDailies\nLolis",
                inline: true,
            },
            {
                name: "\u200b",
                value: `**${user ? user.balance.toLocaleString(undefined, {minimumFractionDigits: 2}) : "0.00"}** lolicoins\n**${user ? user.daily.counter : "0"}**\n**${user ? `${user.inventory.length}` : "0"}** / ${gacha.lolis.length}`,
                inline: true,
            }
        ]
    }
    return message.channel.send({ embed: embed });
};

module.exports.help = {
    name: "account",
    aliases: ["balance", "money", "acc"],
    description: "Check your account info.",
    category: "Gacha",
    servers: ["465232270832304128"]
}