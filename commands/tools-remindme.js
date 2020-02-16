const config = require("../config.json");

module.exports.run = async (message, args) =>
{
    if (args.length < 1) return message.channel.send(`Correct usage: \`${config.prefix}remindme <seconds> [<"optional text">]\``);

    var time = args[0];
    if (args.length > 1) var reason = message.content.match(/"([^"]+)"/)[1];
    else var reason = "";

    message.channel.send(`Reminding you in ${time} seconds!`);

    setReminder = setTimeout(function ()
    {
        return message.channel.send(`${message.author}\n\nI am here to remind you.\n${reason}`);
    }, time * 1000)
};

module.exports.help = {
    name: "remindme",
    description: "Set a short time reminder",
    usage: "remindme <seconds> \"<reason>\"",
    example: "remindme 300 \"fix the bot again\"",
    category: "Tools"
}