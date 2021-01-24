const Chance = require('chance');
const manager = require("./gacha-manager.js");
const { MessageAttachment } = require('discord.js');
let chance = new Chance();

const cost = 2;

module.exports.run = async (message) => {
    let user = gacha.users.findIndex(u => u.id == message.author.id);

    if (user === -1 || gacha.users[user].balance < cost) {
        return message.reply(`not enough lolicoins to roll.\nOne roll costs **${cost.toFixed(2)}** lolicoins, but you only have **${user === -1 ? "0.00" : gacha.users[user].balance.toFixed(2)}** lolicoins.`);
    }

    gacha.users[user].balance -= cost;

    let roll_rarity = chance.weighted(manager.rarities.map(r => r.rarity), manager.rarities.map(r => r.odds));
    let lolis = gacha.lolis.filter(loli => loli.rarity == roll_rarity);
    let loli = chance.pickone(lolis);

    let exists = gacha.users[user].inventory.findIndex(l => l.id == loli.id);
    if (exists == -1) gacha.users[user].inventory.push({ id: loli.id, count: 1 });
    else gacha.users[user].inventory[exists].count++;

    let card = await manager.drawCard(loli, "buffer");
    const image = new MessageAttachment(card, `shdewzchan-gacha-${loli.name.replace(/ /g, "_").toLowerCase()}.png`);

    let embed = {
        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
        author: {
            name: message.author.username,
            icon_url: message.author.avatarURL()
        },
        title: `Rolled **${loli.name}**`,
        description: `${exists !== -1 ? `*Duplicate (${gacha.users[user].inventory[exists].count})*` : "**New loli!**"}\n\n**-${cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}** lolicoins\n**${(gacha.users[user].balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}** lolicoins remaining`,
        image: {
            url: `attachment://shdewzchan-gacha-${loli.name.replace(/ /g, "_").toLowerCase()}.png`,
        },
    }
    return message.channel.send({ files: [image], embed: embed });
};

module.exports.help = {
    name: "pull",
    description: "Roll a loli.",
    category: "Gacha",
    servers: ["465232270832304128"]
}