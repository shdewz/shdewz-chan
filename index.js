const Discord = require("discord.js");
const client = new Discord.Client({ ws: { intents: Discord.Intents.ALL } });
const moment = require("moment");
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

const fs = require("fs");
const config = require("./config.json");
const osu = require("./osu.js");

let ready = false;

global.servers = {};
global.statObj = {};

client.once("ready", async () => {
    osu.init(config.keys.osu.apikey_old);
    client.commands.get("response").init();
    client.commands.get("gachamanager").init();

    client.user.setActivity("Halozy", { type: "LISTENING" });
    statObj = client.commands.get("loadstats").run("settings/stats.json");
    client.commands.get("remindme").init(client);

    ready = true;
    console.log("\nReady!\n");
});

client.on("message", async message => {
    if (message.channel.type !== "text") return; // ignore non-text-channels
    if (message.author.bot) return; // ignore bot messages

    let prefix = config.prefix;

    // response learning
    if (config.responses.collect.includes(message.guild.id) && !message.content.startsWith(prefix) && !message.mentions.has(client.user)) client.commands.get("response").collect(message, client);

    // responding
    if (((!message.content.startsWith(prefix) && Math.random() < 0.08) || message.mentions.has(client.user)) && config.responses.respond.includes(message.guild.id)) client.commands.get("response").respond(message.content, message);

    // ignore non-commands
    if (!message.content.startsWith(prefix)) return;

    //split and format message for use in commands
    let messageArray = message.content.split(" ");
    let commandname = messageArray[0].slice(prefix.length).toLowerCase();
    let args = messageArray.slice(1);

    // run the command
    let command;
    if (client.commands.has(commandname)) command = client.commands.get(commandname);
    else if (client.aliases.has(commandname)) command = client.commands.get(client.aliases.get(commandname));
    else return;

    if (command.help.servers && !command.help.servers.includes(message.guild.id) && message.guild.id != config.testserver) return;
    command.run(message, args, client);

    console.log(`[${moment().format("HH:mm:ss")}] Command '${commandname}' issued by ${message.author.username}`)
});

function loadCommands() {
    client.commands.clear();
    client.aliases.clear();

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
        })
        console.log(`[${moment().format("HH:mm:ss")}] ${jsfile.length} commands loaded succesfully.`);
    });
}

loadCommands();
client.login(config.token);

// handle exiting
process.on('SIGINT', () => {
    let stats = statObj;
    if (stats != {} && ready) fs.writeFileSync("settings/stats.json", JSON.stringify(stats), err => { if (err) return console.log(err); });
    client.commands.get("response").save();
    client.commands.get("gachamanager").save();
    console.log(`[${moment().format("HH:mm:ss")}] Stats saved succesfully, exiting.`);
    process.exit();
});

// autosave every 30 minutes
setInterval(() => {
    let stats = statObj;
    if (stats != {} && ready) fs.writeFileSync("settings/stats.json", JSON.stringify(stats), err => { if (err) return console.log(err); });
    console.log(`[${moment().format("HH:mm:ss")}] Autosave successful.`);
}, 30 * 60 * 1000);