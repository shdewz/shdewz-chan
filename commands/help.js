const config = require("../config.json");

module.exports.run = async (message, args, client) => {

    if (args[0]) {
        let server = statObj.serverstats.find(s => s.id == message.guild.id);
        let prefix = server && server.prefix ? server.prefix : config.prefix;
        var command = args[0];
        if (client.commands.has(command) || client.aliases.has(command)) {
            if (client.commands.has(command)) command = client.commands.get(command);
            else command = client.commands.get(client.aliases.get(command));

            if (command.help.servers && !command.help.servers.includes(message.guild.id) && message.guild.id != config.testserver) return;

            var exampletext = "";
            if (command.help.example) exampletext = `\n**Example:** \`${prefix}${command.help.example}\``;
            if (command.help.example2) exampletext += `\n**Example:** \`${prefix}${command.help.example2}\``;

            if (!command.help.usage) var usage = command.help.name;
            else var usage = command.help.usage;

            let aliastext = "";
            if (command.help.aliases) {
                aliastext = `\n\n**Aliases:**\n\`${command.help.aliases.join("\`, \`")}\``;
            }

            let embed = {
                color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                author: {
                    name: `${prefix}${command.help.name}`
                },
                description: `*${command.help.description}*\n\n**Usage:** \`${prefix}${usage}\`${exampletext}${aliastext}`,
                footer: {
                    text: `Use ${prefix}help for a list of all commands`
                }
            }
            return message.channel.send({ embed: embed });
        }
        else return message.reply(`command ${command} not found.`);
    }
    else {
        let commands = Array.from(client.commands).map(c => ({ name: c[1].help.name, category: c[1].help.category, servers: c[1].help.servers ? c[1].help.servers : [] })).filter(c => c.category.toLowerCase() != "sys");
        let categories = [...new Set(commands.map(c => c.category))];
        let fields = [];

        categories.forEach(category => {
            let cmds = commands.filter(c => c.category == category && (c.servers.length == 0 || c.servers.includes(message.guild.id) || message.guild.id == config.testserver)).map(c => c.name);
            if (cmds.length == 0) return;

            fields.push({
                name: category,
                value: `\`${cmds.join("` `")}\``
            })
        });

        let embed = {
            color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
            author: {
                name: `${client.user.username} command list:`,
                icon_url: client.user.avatarURL()
            },
            fields: fields,
            footer: {
                text: `use '${config.prefix}help <command>' for detailed info about a certain command`
            }
        }
        return message.channel.send({ embed: embed });
    }
};

module.exports.help = {
    name: "help",
    aliases: ["commands"],
    description: "Shows help about different commands",
    usage: "help <command>",
    example: "help osu",
    category: "General"
}