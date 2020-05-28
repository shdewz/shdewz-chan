const contentarray = require("../awawa.json");
const fs = require("fs");

module.exports.run = async (message, args) => {
    if (args.length == 0) return;

    if (args[0] == "-add") {
        if (args.length < 3) return message.reply("too few arguments");

        var name = args.slice(1).join(" ").split(" | ")[0];
        var content = args.slice(1).join(" ").split(" | ")[1];

        for (var i = 0; i < contentarray.length; i++) {
            if (contentarray[i].name == name || contentarray[i].aliases.includes(name)) {
                return message.reply(`${name} already exists.`);
            }
        }

        var obj = {
            name: name,
            aliases: [],
            content: content
        }

        contentarray.push(obj);
        fs.writeFileSync("awawa.json", JSON.stringify(contentarray), err => { if (err) return console.log(err); });
        return message.reply("content added succesfully.");
    }
    else if (args[0] == "-alias") {
        var name = args.slice(1).join(" ").split(" | ")[0];
        var alias = args.slice(1).join(" ").split(" | ")[1];

        for (var i = 0; i < contentarray.length; i++) {
            if (contentarray[i].name == name || contentarray[i].aliases.includes(name)) {
                if (contentarray[i].aliases.includes(alias)) return message.reply(`${name} already has the alias ${alias}.`)
                contentarray[i].aliases.push(alias);
                fs.writeFileSync("awawa.json", JSON.stringify(contentarray), err => { if (err) return console.log(err); });
                return message.reply("alias added succesfully.");
            }
        }
        return message.reply(`${name} not found.`)
    }
    else {
        var query = args.join(" ")

        for (var i = 0; i < contentarray.length; i++) {
            if (contentarray[i].name == query || contentarray[i].aliases.includes(query)) {
                return message.channel.send(contentarray[i].content);
            }
        }
    }
};

module.exports.help = {
    name: "awawa",
    description: "AWAWA",
    category: "Fun"
}