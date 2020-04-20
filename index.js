const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

const fs = require("fs");
const config = require("./config.json");
const osu = require("./osu.js");

global.servers = {};

client.once("ready", async () => {
    osu.init(config.apikey);
    console.log("\nReady!\n");
    client.user.setActivity("nothing");
});

fs.readdir("./commands", (err, files) => {
    if (err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) return console.log("Couldn't find commands.");

    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        client.commands.set(props.help.name, props);
        if (props.help.aliases) {
            props.help.aliases.forEach(alias => {
                client.aliases.set(alias, props.help.name);
            });
        }

        console.log(`${f} loaded!`);
    })
});

client.on("message", async message => {
    if (message.channel.type !== "text") return; // ignore non-text-channels
    if (message.author.bot) return; // ignore bot messages
    
    // ignore non-commands
    let prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;

    //split and format message for use in commands
    let messageArray = message.content.split(" ");
    let command = messageArray[0].slice(prefix.length).toLowerCase();
    let args = messageArray.slice(1);

    // run the command
    if (client.commands.has(command)) {
        client.commands.get(command).run(message, args, client);
    }
    else if (client.aliases.has(command)) {
        client.commands.get(client.aliases.get(command)).run(message, args, client);
    }
    else return;

    console.log(`Command '${command}' issued by ${message.author.username}`)

})

client.on("guildMemberAdd", async member => {
    const channel = member.guild.channels.find(ch => ch.name === "general");
    if (!channel) return;
    client.commands.get("serverjoin").run(member, channel, server);
})

client.login(config.token);