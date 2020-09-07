const fs = require("fs");

module.exports.run = filename => {
    try {
        if (fs.existsSync(filename)) return JSON.parse(fs.readFileSync(filename, "utf-8"));
        else return;
    }
    catch (error) { return console.log(error); }
};

module.exports.help = {
    name: "loadstats",
    category: "sys"
}