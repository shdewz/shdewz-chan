const config = require("../config.json");
const osu = require("../osu.js");

module.exports.run = async (message, args, client) => {

    if (args.length == 0) message.reply(`Correct usage: \`${config.prefix}osuset <username>\``);

    try {
        return osu.setUser(args.join("_"), message, client);
    }
    catch (error) {
        console.log(error);
        return message.channel.send(`Something happened!\n\`\`\`\n${error}\n\`\`\``) // send error as message
    }
};

module.exports.help = {
    name: "osuset"
}