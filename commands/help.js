const config = require("../config.json");

module.exports.run = async (message, args, client) => {

    if (args[0]) {
        var command = args[0];
        if (client.commands.has(command) || client.aliases.has(command)) {
            if (client.commands.has(command)) command = client.commands.get(command);
            else command = client.commands.get(client.aliases.get(command));

            var exampletext = "";
            if (command.help.example) exampletext = `\n**Example:** \`${config.prefix}${command.help.example}\``;
            if (command.help.example2) exampletext += `\n**Example:** \`${config.prefix}${command.help.example2}\``;

            if (!command.help.usage) var usage = command.help.name;
            else var usage = command.help.usage;

            let aliastext = "";
            if (command.help.aliases) {
                aliastext = `\n\n**Aliases:**\n\`${command.help.aliases.join("\`, \`")}\``;
            }

            let embed = {
                color: message.member.displayColor,
                author: {
                    name: `${config.prefix}${command.help.name}`
                },
                description: `*${command.help.description}*\n\n**Usage:** \`${config.prefix}${usage}\`${exampletext}${aliastext}`,
                footer: {
                    text: `Use ${config.prefix}help for a list of all commands`
                }
            }
            return message.channel.send({ embed: embed });
        }
        else return message.reply(`command ${command} not found.`);
    }
    else {
        var commands = [];
        for (var i = 0; i < Array.from(client.commands).length; i++) {
            var command = Array.from(client.commands)[i][1];
            if (!command.help) continue;
            if (command.help && command.help.category == "sys") continue;

            var found = false;
            for (var n = 0; n < commands.length; n++) {
                if (commands[n].category && commands[n].category == command.help.category) {
                    if (commands[n].names) {
                        commands[n].names += `\`${command.help.name}\` `;
                    }
                    else commands[n].names = `\`${command.help.name}\` `;
                    found = true;
                }
            }

            if (!found) {
                var obj = { category: command.help.category, names: `\`${command.help.name}\` ` };
                commands.push(obj);
            }
        }

        var fields = [];
        for (var i = 0; i < commands.length; i++) {
            var obj = { name: commands[i].category, value: commands[i].names };
            fields.push(obj);
        }

        let embed = {
            color: message.member.displayColor,
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