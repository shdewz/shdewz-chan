const fs = require("fs");
const Canvas = require("canvas");
let users_filename = "settings/gacha/users.json";
let lolis_filename = "settings/gacha/lolis.json";

module.exports.init = async () => {
    global.gacha = {};
    if (fs.existsSync(users_filename)) gacha.users = JSON.parse(fs.readFileSync(users_filename, "utf-8"));
    if (fs.existsSync(lolis_filename)) gacha.lolis = JSON.parse(fs.readFileSync(lolis_filename, "utf-8"));

    setInterval(() => { save(users_filename) }, 30 * 60 * 1000);
};

module.exports.save = () => { save(users_filename) };

module.exports.rarities = [
    {
        rarity: 1,
        odds: 3,
        name: "5*",
        color: "#ffc369",
        color_dark: "#ffc369"
    },
    {
        rarity: 2,
        odds: 17,
        name: "4*",
        color: "#cb69ff",
        color_dark: "#cb69ff"
    },
    {
        rarity: 3,
        odds: 80,
        name: "3*",
        color: "#7cc9f2",
        color_dark: "#3d86ad"
    }
]

module.exports.drawCard = (loli, returntype) => {
    return new Promise(async resolve => {
        let width = 400;
        let height = 600;

        let color = this.rarities.find(r => r.rarity == loli.rarity).color;
        let color_dark = this.rarities.find(r => r.rarity == loli.rarity).color_dark;

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

        let buffer = returntype == "canvas" ? canvas : canvas.toBuffer('image/png');
        resolve(buffer);
    });
}

function save(filename) { fs.writeFileSync(filename, JSON.stringify(gacha.users), err => { if (err) return console.log(err); }); }

module.exports.help = {
    name: "gachamanager",
    category: "sys"
}