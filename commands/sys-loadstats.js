const fs = require("fs");

module.exports.run = function () {
    try {
        if (fs.existsSync("stats.json")) return JSON.parse(fs.readFileSync("stats.json", "utf-8"));
        else return;
    }
    catch (error) { return console.log(error); }
};

module.exports.help = {
    name: "loadstats",
    category: "sys"
}