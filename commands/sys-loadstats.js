const fs = require("fs");

module.exports.run = function () {
    try {
        if (fs.existsSync("stats.json")) {
            var stat = JSON.parse(fs.readFileSync("stats.json", "utf-8"));
            return stat;
        }
        else return;
    }
    catch (error) {
        return console.log(error);
    }
};

module.exports.help = {
    name: "loadstats",
    category: "sys"
}