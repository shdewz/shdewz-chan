const Discord = require("discord.js");
const client = new Discord.Client();
const moment = require("moment");
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

const fs = require("fs");
const config = require("./config.json");
const osu = require("./osu.js");

let ready = false;

global.servers = {};
global.statObj = {};
global.responseObj = {};

client.once("ready", async () => {
    osu.init(config.apikey);
    console.log("\nReady!\n");
    client.user.setActivity("nothing");
    statObj = client.commands.get("loadstats").run("stats.json");
    responseObj = client.commands.get("loadstats").run("the_brains.json");
    client.commands.get("remindme").init(client);
    ready = true;
});

client.on("message", async message => {
    if (message.channel.type !== "text") return; // ignore non-text-channels
    if (message.author.bot) return; // ignore bot messages

    if (message.author.id == "250693235091963904" && message.content == `${config.prefix}reloadcommands`) return reloadCommands();

    // response learning
    if (!["!", "%", "<", ">", "$", "/"].includes(message.content.substring(0, 1))) client.commands.get("response").collect(message);

    // responding
    if (((!message.content.startsWith(config.prefix) && Math.random() < 0.08) || message.mentions.has(client.user)) && message.guild.id == "667863566279507994") client.commands.get("response").respond(message.content, message.channel);

    // special messages
    if (message.content == ")/") return message.channel.send(")/");

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
    } else if (client.aliases.has(command)) {
        client.commands.get(client.aliases.get(command)).run(message, args, client);
    } else return;

    console.log(`[${moment().format("HH:mm:ss")}] Command '${command}' issued by ${message.author.username}`)
})

// command reload
function reloadCommands() {
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

reloadCommands();
client.login(config.token);

// handle exiting
process.on('SIGINT', () => {
    let stats = statObj;
    let responses = responseObj;
    if (stats != {} && ready) fs.writeFileSync("stats.json", JSON.stringify(stats), err => { if (err) return console.log(err); });
    if (responses != {} && ready) fs.writeFileSync("the_brains.json", JSON.stringify(responses), err => { if (err) return console.log(err); });
    console.log(`[${moment().format("HH:mm:ss")}] Stats saved succesfully, exiting.`);
    process.exit();
});

// autosave every 30 minutes
setInterval(() => {
    let stats = statObj;
    let responses = responseObj;
    if (stats != {} && ready) fs.writeFileSync("stats.json", JSON.stringify(stats), err => { if (err) return console.log(err); });
    if (responses != {} && ready) fs.writeFileSync("the_brains.json", JSON.stringify(responses), err => { if (err) return console.log(err); });
    console.log(`[${moment().format("HH:mm:ss")}] Autosave successful.`);
}, 30 * 60 * 1000);