const Canvas = require("canvas");
const manager = require("./gacha-manager.js");
const { MessageAttachment } = require('discord.js');

Canvas.registerFont('./fonts/B2-Medium.ttf', { family: 'B2-Medium' });

module.exports.run = async (message, args, client) => {
    let id = message.mentions.members.first() ? message.mentions.members.first().id : message.author.id;
    let user = gacha.users.find(u => u.id == id);
    let userobj = client.users.cache.get(id);
    let all = false;

    if (args.includes("-all")) {
        all = true;
    }
    else if (!user) return message.channel.send(`nothing found for **${userobj.username}**.`);

    if (args.includes("-text") && !all) {
        let embed = {
            color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
            author: {
                name: userobj.username,
                icon_url: userobj.avatarURL()
            },
            description: `**Lolis obtained:**`,
            fields: [
                {
                    name: "5\*",
                    value: user.inventory.sort((a, b) => b.count - a.count).filter(loli => gacha.lolis.filter(loli => loli.rarity == 1).map(loli => loli.id).some(l => l == loli.id)).map(loli => `**${gacha.lolis.find(l => l.id == loli.id).name}** (${loli.count})`).join("\n") + "\u200b",
                    inline: true,
                },
                {
                    name: "4\*",
                    value: user.inventory.sort((a, b) => b.count - a.count).filter(loli => gacha.lolis.filter(loli => loli.rarity == 2).map(loli => loli.id).some(l => l == loli.id)).map(loli => `**${gacha.lolis.find(l => l.id == loli.id).name}** (${loli.count})`).join("\n") + "\u200b",
                    inline: true,
                },
                {
                    name: "3\*",
                    value: user.inventory.sort((a, b) => b.count - a.count).filter(loli => gacha.lolis.filter(loli => loli.rarity == 3).map(loli => loli.id).some(l => l == loli.id)).map(loli => `**${gacha.lolis.find(l => l.id == loli.id).name}** (${loli.count})`).join("\n") + "\u200b",
                    inline: true,
                },
            ]
        }
        return message.channel.send({ embed: embed });
    }
    else {
        let lolis = all ? gacha.lolis.sort((a, b) => a.rarity - b.rarity) : user.inventory.sort((a, b) => b.count - a.count).sort((a, b) => gacha.lolis.find(l => l.id == a.id).rarity - gacha.lolis.find(l => l.id == b.id).rarity);

        let columns = 8;
        let rows = Math.ceil(lolis.length / columns);

        let padding = 10;
        let width = 710 + padding * 2;
        let height = rows * 140 + Math.max(rows - 1, 0) * 10 + padding * 2;

        var canvas = Canvas.createCanvas(width, height);
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = "#1f1f1f";
        ctx.fillRect(0, 0, width, height);

        new Promise(resolve => {
            lolis.forEach(async (loli_, i, a) => {
                let loli = gacha.lolis.find(l => l.id == loli_.id);

                let row = Math.floor(i / 8);
                let column = i % 8;

                let card = await manager.drawCard(loli, "canvas");
                ctx.drawImage(card, padding + column * 90, padding + row * 150, 80, 120);

                ctx.textAlign = "center";
                let text = loli.name;

                let fontSize = 13;
                ctx.font = `${fontSize}px B2-Medium`;
                do { ctx.font = `${fontSize -= 0.2}px B2-Medium`; }
                while (ctx.measureText(text).width > 80);

                ctx.fillStyle = "#ffffff";
                ctx.fillText(text, padding + column * 90 + 40, padding + row * 150 + 120 + 16)

                if (i === a.length - 1) resolve();
            });
        }).then(() => {
            let buffer = canvas.toBuffer('image/png');
            const image = new MessageAttachment(buffer, `shdewzchan-gacha-${userobj.username.replace(/ /g, "_").toLowerCase()}-inventory.png`);

            let embed = {
                color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                author: all ? {} : {
                    name: userobj.username,
                    icon_url: userobj.avatarURL()
                },
                title: `${all ? "**All lolis:**" : `**Loli inventory:**`}`,
                description: `${all ? `Total lolis: **${lolis.length}**` : `Total lolis: **${lolis.map(l => l.count).reduce((a, b) => a + b, 0)}**\nUnique lolis: **${lolis.length}** / ${gacha.lolis.length}`}`,
                image: {
                    url: `attachment://shdewzchan-gacha-${userobj.username.replace(/ /g, "_").toLowerCase()}-inventory.png`,
                },
            }
            return message.channel.send({ files: [image], embed: embed });
        });
    }
};

module.exports.help = {
    name: "inventory",
    aliases: ["lolis", "characters"],
    description: "Check your account inventory.",
    category: "Gacha",
    servers: ["465232270832304128"]
}