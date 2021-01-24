const manager = require("./gacha-manager.js");
const { MessageAttachment } = require('discord.js');

module.exports.run = async (message, args, client) => {
    let id = message.author.id;

    let keyword = args.join(" ");

    let loli = gacha.lolis.find(l => l.name.toLowerCase().includes(keyword) || l.id == keyword);
    if (!loli) return message.reply(`no lolis found with keyword **${keyword}**.`);

    let users = gacha.users.filter(user => user.inventory.map(i => i.id).includes(loli.id));
    let count = users.map(u => u.inventory.find(i => i.id == loli.id).count).reduce((a, b) => a + b, 0);

    let card = await manager.drawCard(loli, "buffer");
    const image = new MessageAttachment(card, `shdewzchan-gacha-${loli.name.replace(/ /g, "_").toLowerCase()}.png`);

    let embed = {
        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
        author: {
            name: loli.name,
        },
        thumbnail: {
            url: `attachment://shdewzchan-gacha-${loli.name.replace(/ /g, "_").toLowerCase()}.png`
        },
        fields: [
            {
                name: `**Info:**`,
                value: `▸ **ID:** ${loli.id}\n▸ **Rarity:** ${6 - loli.rarity}\*\n▸ **Times rolled:** ${count}`
            },
            {
                name: `**Users with this loli:**`,
                value: `${users.length == 0 ? "No one!" : `${users.map(u => u.id == id ? `**${client.users.cache.get(u.id).username}**` : client.users.cache.get(u.id).username).join(", ")}`}`
            }
        ]
    }
    return message.channel.send({ files: [image], embed: embed });
};

module.exports.help = {
    name: "view",
    aliases: ["find"],
    description: "View statistics for a certain loli.",
    category: "Gacha",
    servers: ["465232270832304128"]
}