const Discord = require('discord.js');
const client = new Discord.Client();

client.commands = new Discord.Collection();
const fs = require("fs");
const config = require("./config.json");

// read command files from folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// set commands in the collection
for (const file of commandFiles)
{
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once("ready", async () =>
{
    console.log("Ready!\n");
    client.user.setActivity(`!stats`);
});

// receive message in chat

client.on('message', async message =>
{
    if (message.channel.type !== "text") return; // ignore non-text-channels
    if (message.author.bot) return; // ignore bot messages

    var biddingActive = false;
    // ignore non-commands, and normal non-numeric messages during bidding
    var prefix = config.prefix;
    if (!message.content.startsWith(prefix) && (!biddingActive && isNaN(message.content))) return;

    if (message.content.startsWith(prefix))
    {
        // split message to arguments
        const args = message.content.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();

        // return if command doesn't exist
        if (!client.commands.has(command)) return;

        try
        {
            // load stats and execute command
            var stat = client.commands.get("loadstats").execute();
            client.commands.get(command).execute(message, args, stat);
            console.log(`Command '${command}' issued by ${message.author.username}`)
        }
        catch (error)
        {
            console.error(error);
            return message.reply(`Something happened!\n\`\`\`\n${error}\n\`\`\``);
        }
    }
    // check if message is just a number and ignore large numbers (*may* fix images interfering with this)
    else if (!isNaN(message.content) && parseInt(message.content) < 2 * startmoney)
    {
        // bidding functions here
    }
    else return; // nothing checks out so return
})

client.login(config.token);