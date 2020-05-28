const fs = require('fs');

module.exports.run = async (message, args) => {
    if (args.length == 0) {
        var folders = fs.readdirSync("./img/ss/");
        if (folders[0].startsWith("awawa")) folders.shift();
        return message.channel.send(`**Available content:**\n\`${folders.join("\`, \`")}\``);
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
        console.log("ow")
        fs.readFile(`${dir}/${file}`, 'utf8', (err, data) => {
            if (err) throw err;
            return message.channel.send(data);
        });
    }
    else return message.channel.send({ files: [`${dir}/${file}`] });
}

module.exports.help = {
    name: "poggers",
    description: "poggers.",
    category: "Fun"
}