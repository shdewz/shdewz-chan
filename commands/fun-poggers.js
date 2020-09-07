const fs = require('fs');

module.exports.run = async (message, args) => {
    if (args.length == 0 || args[0].startsWith("-")) {
        let sort = false;
        if (args.includes("-sort")) sort = true;

        if (args.includes("-list")) {
            args.splice(args.indexOf("-list"), 1);

            let dir = "./img/ss/" + args.join("_").toLowerCase();

            try {
                var files = fs.readdirSync(dir);
                if (files[0] == "#DISABLED#") files.shift();
            }
            catch (err) {
                if (err.code == "ENOENT") return message.channel.send(`No funny content of ${args.join(" ")} found.`);
                else console.log(err.code);
            }

            return message.channel.send(`**Available content for ${args[0]}:**\n\`${files.join("`, `")}\``);
        }

        var folders = fs.readdirSync("./img/ss/");
        if (folders[0].startsWith("awawa")) folders.shift();
        let content = [];
        let output = "";

        for (var i = 0; i < folders.length; i++) {
            let count = fs.readdirSync("./img/ss/" + folders[i]).length;
            let obj = {
                name: folders[i],
                count: count
            }
            content.push(obj);
        }

        if (sort) content.sort(GetSortOrder("count")).reverse();
        else content.sort(GetSortOrder("name"));

        for (var i = 0; i < content.length; i++) {
            output += `\`${content[i].name} (${content[i].count})\`, `;
        }

        return message.channel.send(`**Available content:**\n${output}`);
    }

    if (args.includes("-choose")) {
        if (args.length < 2) return message.reply("missing arguments.");

        let file = args[args.indexOf("-choose") + 1].toLowerCase();
        args.splice(args.indexOf("-choose"), 2);
        let dir = `./img/ss/${args.join("_").toLowerCase()}`;

        try {
            var files = fs.readdirSync(dir);
            if (files[0] == "#DISABLED#") files.shift();
        }
        catch (err) {
            if (err.code == "ENOENT") return message.channel.send(`No funny content of ${args.join(" ")} found.`);
            else console.log(err.code);
        }

        if (!files.includes(file)) return message.channel.send(`File ${file} not found.`)
        let filedir = `${dir}/${file}`;

        if (file.endsWith(".txt")) {
            fs.readFile(`${filedir}`, 'utf8', (err, data) => {
                if (err) throw err;
                return message.channel.send(data);
            });
        }
        else return message.channel.send({ files: [`${filedir}`] });
    }

    var dir = "./img/ss/" + args.join("_").toLowerCase();

    try {
        var files = fs.readdirSync(dir);
        if (files[0] == "#DISABLED#") files.shift();
    }
    catch (err) {
        if (err.code == "ENOENT") return message.channel.send(`No funny content of ${args.join(" ")} found.`);
        else console.log(err.code);
    }

    let file = files[Math.floor(Math.random() * files.length)];
    if (file.endsWith(".txt")) {
        fs.readFile(`${dir}/${file}`, 'utf8', (err, data) => {
            if (err) throw err;
            return message.channel.send(data);
        });
    }
    else return message.channel.send({ files: [`${dir}/${file}`] });
}

function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) return 1;
        else if (a[prop] < b[prop]) return -1;
        return 0;
    }
}

module.exports.help = {
    name: "poggers",
    description: "poggers.",
    category: "Fun"
}