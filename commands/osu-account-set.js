const config = require("../config.json");
const osu = require("../osu.js");

module.exports.run = async (message, args) => {

    if (args.length == 0) return;

    try { return osu.setUser(args.join("_"), message); }
    catch (error) { return console.log(error); }
};

module.exports.help = {
    name: "osuset",
    description: "Link your osu! account to your discord account",
    usage: "osuset <user>",
    example: "osuset shdewz",
    category: "osu!"
}