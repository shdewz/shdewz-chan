const moment = require("moment");
const Chance = require('chance');
const Canvas = require("canvas");
const { MessageAttachment } = require('discord.js')
let chance = new Chance();

const cost = 2;
const rarities = [
    {
        rarity: 1,
        odds: 3,
        color: "#ffc369",
        color_dark: "#ffc369"
    },
    {
        rarity: 2,
        odds: 17,
        color: "#cb69ff",
        color_dark: "#cb69ff"
    },
    {
        rarity: 3,
        odds: 80,
        color: "#7cc9f2",
        color_dark: "#3d86ad"
    }
]

module.exports.run = async (message) => {
    let user = gacha.users.findIndex(u => u.id == message.author.id);

    if (user === -1 || gacha.users[user].balance < cost) {
        return message.reply(`not enough lolicoins to roll.\nOne roll costs **${cost.toFixed(2)}** lolicoins, but you only have **${user === -1 ? "0.00" : gacha.users[user].balance.toFixed(2)}** lolicoins.`);
    }

    gacha.users[user].balance -= cost;

    let roll_rarity = chance.weighted(rarities.map(r => r.rarity), rarities.map(r => r.odds));
    let lolis = gacha.lolis.filter(loli => loli.rarity == roll_rarity);
    let loli = chance.pickone(lolis);

    let exists = gacha.users[user].inventory.findIndex(l => l.id == loli.id);
    if (exists == -1) gacha.users[user].inventory.push({ id: loli.id, count: 1 });
    else gacha.users[user].inventory[exists].count++;

    let card = await drawCard(loli);
    const image = new MessageAttachment(card, `shdewzchan-gacha-${loli.name.replace(/ /g, "_").toLowerCase()}.png`);

    let embed = {
        color: message.member.displayColor,
        author: {
            name: message.author.username,
            icon_url: message.author.avatarURL()
        },
        title: `Rolled **${loli.name}**`,
        description: `**-${cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}** lolicoins\n**${(gacha.users[user].balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}** lolicoins remaining`,
        image: {
            url: `attachment://shdewzchan-gacha-${loli.name.replace(/ /g, "_").toLowerCase()}.png`,
        },
    }
    return message.channel.send({ files: [image], embed: embed });
};

async function drawCard(loli) {
    return new Promise(async resolve => {
        let width = 400;
        let height = 600;

        let color = rarities.find(r => r.rarity == loli.rarity).color;
        let color_dark = rarities.find(r => r.rarity == loli.rarity).color_dark;

        var canvas = Canvas.createCanvas(width, height);
        var ctx = canvas.getContext('2d');

        var grd = ctx.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(0, color);
        grd.addColorStop(1, color_dark);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);

        let img_url = loli.image == "" ? "settings/gacha/img/default.png" : "settings/gacha/img/" + loli.image;
        let image = await Canvas.loadImage(img_url);
        ctx.drawImage(image, 0, 0, width, height);

        ctx.shadowColor = 'black';
        ctx.shadowBlur = 40;

        let star_img = await Canvas.loadImage(`settings/gacha/img/assets/stars_${loli.rarity}.png`);
        ctx.drawImage(star_img, 0, height - 100, width, 80);

        let buffer = canvas.toBuffer('image/png');
        resolve(buffer);
    });
}

module.exports.help = {
    name: "gacha",
    aliases: ["pull"],
    description: "Roll a loli.",
    category: "Gacha"
}