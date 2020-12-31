const fs = require('fs');
const config = require("../config.json");

const types = {
    "image": "🖼️",
    "audio": "🎤",
    "video": "🎞️",
    "text": "📄",
    "link": "🔗"
}

const admins = [
    "250693235091963904",
    "184753701519360001",
    "227307203567157248",
    "215125441277722625"
]

module.exports.run = async (message, args) => {
    let poggers = JSON.parse(fs.readFileSync("./settings/poggers.json", "utf-8"));

    if (args.includes("-add") && admins.includes(message.author.id)) {
        try {
            args.splice(args.indexOf("-add"), 1);
            if (args.length < 4) return message.reply("missing arguments.");
            let user = args[0];
            let name = args[1];
            let url = args[2].replace(/[<>]/g, "");
            let type = args[3];

            let contentobj = {
                name: name,
                url: url,
                type: type,
                nsfw: args.includes("-nsfw")
            };

            let i = poggers.users.findIndex(obj => obj.name.toLowerCase() == user.toLowerCase());
            if (i === -1) {
                let obj = {
                    name: args[args.indexOf("-user") + 1],
                    content: [contentobj]
                };
                poggers.users.push(obj);
            }
            else {
                // check duplicates
                let d = poggers.users[i].content.find(o => o.name.toLowerCase() == name.toLowerCase() || o.url.toLowerCase() == url.toLowerCase());
                if (typeof d === "undefined") poggers.users[i].content.push(contentobj);
                else return message.reply(`content already exists with the same **name** and/or **url**.`);
            };

            fs.writeFileSync("./settings/poggers.json", JSON.stringify(poggers), err => { if (err) return console.log(err); });
            return message.reply(`content **${name}** succesfully added for **${args[0]}**`);
        }
        catch (err) { message.reply(`**${err.name}:** ${err.message}`); return console.error(err); }
    }

    if (args.includes("-remove") && admins.includes(message.author.id)) {
        try {
            args.splice(args.indexOf("-remove"), 1);
            if (args.length < 2) return message.reply("missing arguments.");
            let username = args[0];
            let name = args[1];

            let user = poggers.users.find(u => u.name.toLowerCase() == username.toLowerCase());
            if (typeof user === "undefined") return message.reply(`user **${username}** not found.`);

            let content = user.content.find(c => c.name.toLowerCase() == name.toLowerCase());
            if (typeof user === "undefined") return message.reply(`content **${name}** not found for **${user.name}**.`);

            let i = poggers.users.findIndex(u => u.name.toLowerCase() == user.name.toLowerCase());
            let i_c = poggers.users[i].content.findIndex(c => c.name.toLowerCase() == content.name.toLowerCase());

            if (poggers.users[i].content.length <= 1) poggers.users.splice(i, 1);
            else poggers.users[i].content.splice(i_c, 1);

            fs.writeFileSync("./poggers.json", JSON.stringify(poggers), err => { if (err) return console.log(err); });
            return message.reply(`content **${content.name}** succesfully removed from **${user.name}**`);
        }
        catch (err) { message.reply(`**${err.name}:** ${err.message}`); return console.error(err); }
    }

    let query = args.filter(a => !a.startsWith("-"));

    if (query.length == 0) {
        if (!args.includes("-sort")) poggers.users.sort((a, b) => { return a.content.length - b.content.length; }).reverse();
        else poggers.users.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

        let embed = {
            color: message.member.displayColor,
            title: `**poggers list:**`,
            fields: [
                {
                    name: "Name",
                    value: poggers.users.map(u => u.name).join("\n"),
                    inline: true
                },
                {
                    name: "Count",
                    value: poggers.users.map(u => u.content.length).join("\n"),
                    inline: true
                }
            ],
            footer: {
                text: `use '${config.prefix}poggers <name>' to roll random funny content`
            }
        }
        return message.channel.send({ embed: embed });
    }

    let user = poggers.users.find(obj => obj.name.toLowerCase() == query.join(" ").toLowerCase());
    if (typeof user === "undefined") return message.reply(`no funny content of **${args.join(" ")}** found.`);
    user.content.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

    if (args.includes("-list")) {
        let embed = {
            color: message.member.displayColor,
            title: `**content list for ${user.name}:**`,
            fields: [
                {
                    name: "Name",
                    value: user.content.map(c => c.name).join("\n"),
                    inline: true
                },
                {
                    name: "Type",
                    value: user.content.map(c => `${types[c.type]} ${c.type.charAt(0).toUpperCase() + c.type.slice(1)}`).join("\n"),
                    inline: true
                },
                {
                    name: "URL/Text",
                    value: user.content.map(c => `${["image", "audio", "video"].includes(c.type) ? `[${c.name.toLowerCase()}.${c.url.split('.').pop().length > 4 ? "png" : c.url.split('.').pop()}](${c.url})` : c.url}`).join("\n"),
                    inline: true
                }
            ],
            footer: {
                text: `use '${config.prefix}poggers <name>' to roll random funny content`
            }
        }
        return message.channel.send({ embed: embed });
    }

    let content = user.content[Math.floor(Math.random() * user.content.length)];

    if (["image", "audio", "video"].includes(content.type)) {
        let extension = content.url.split('.').pop().length > 4 ? "png" : content.url.split('.').pop();

        return message.channel.send({
            files: [{
                attachment: content.url,
                name: `${content.nsfw ? "SPOILER_" : ""}${content.name.split(" ").join("_")}.${extension}`
            }]
        });
    }
    else if (["text", "link"].includes(content.type)) {
        let text = content.nsfw ? `||${content.url}||` : content.url;
        return message.channel.send(text);
    }
}

module.exports.help = {
    name: "poggers",
    description: "roll a random funny image of someone.\n\n**Available parameters:**\n`-sort` if name is not specified, sorts the list alphabetically\n`-list` lists all content for the specified user\n~~`-choose <content>` chooses a specific content~~",
    usage: "poggers [<name>] [<parameters>]",
    category: "Fun"
}