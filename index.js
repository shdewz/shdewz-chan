const Discord = require('discord.js');
const client = new Discord.Client();

client.commands = new Discord.Collection();
const fs = require("fs");
const config = require("./config.json");

global.biddingActive = false; // you can't stop me from doing this
var stat;

client.once("ready", async () =>
{
    console.log("\nReady!\n");
    client.user.setActivity(`nothing`);
});

fs.readdir("./commands", (err, files) =>
{
    if (err) console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0)
    {
        console.log("Couldn't find commands.");
        return;
    }
    jsfile.forEach((f, i) =>
    {
        let props = require(`./commands/${f}`);
        client.commands.set(props.help.name, props);

        console.log(`${f} loaded!`);
    })
});

client.on('message', async message =>
{
    if (message.channel.type !== "text") return; // ignore non-text-channels
    if (message.author.bot) return; // ignore bot messages

    // ignore non-commands
    var prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;

    //split and format message for use in commands
    let messageArray = message.content.split(" ");
    let command = messageArray[0].slice(prefix.length);
    let args = messageArray.slice(1);

    //find and run requested command
    let commandfile = client.commands.get(command);

    if (commandfile)
    {
        commandfile.run(client, message, args);
    }

    console.log(`Command '${command}' issued by ${message.author.username}`)

})

client.login(config.token);