const fs = require("fs");
let users_filename = "settings/gacha/users.json";
let lolis_filename = "settings/gacha/lolis.json";

module.exports.init = async () => {
    global.gacha = {};
    if (fs.existsSync(users_filename)) gacha.users = JSON.parse(fs.readFileSync(users_filename, "utf-8"));
    if (fs.existsSync(lolis_filename)) gacha.lolis = JSON.parse(fs.readFileSync(lolis_filename, "utf-8"));

    setInterval(() => { save(users_filename) }, 30 * 60 * 1000);
};

module.exports.save = () => { save(users_filename) };

function save(filename) { fs.writeFileSync(filename, JSON.stringify(gacha.users), err => { if (err) return console.log(err); }); }

module.exports.help = {
    name: "gachamanager",
    category: "sys"
}