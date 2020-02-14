module.exports.run = async (message, args) => {
    try {
        if (args.length > 0 && !isNaN(args[0])) // !roll <n>
        {
            // draw random integer between 1 and second argument
            message.channel.send(`${message.author} rolls \`${Math.floor(Math.random() * args[0]) + 1}\` points!`);
        }
        else // !roll
        {
            // draw random integer between 1 and 100
            message.channel.send(`${message.author} rolls \`${Math.floor(Math.random() * 100) + 1}\` points!`);
        }
        return;
    }
    catch (error) {
        console.log(error);
        return message.channel.send(`Something happened!\n\`\`\`\n${error}\n\`\`\``) // send error as message
    }
};

module.exports.help = {
    name: "roll",
    aliases: ["rng", "random"]
}