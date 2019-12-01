module.exports = {
    name: 'roll',
    description: 'Returns a random integer.',
    execute(message, args)
    {
        try
        {
            if (args.length >= 1 && !isNaN(args[0])) // !roll 69
            {
                // draw random integer between 1 and second argument
                message.channel.send(`${message.author.username} rolls \`${Math.floor(Math.random() * args[0]) + 1}\`!`);
            }
            else // !roll
            {
                // draw random integer between 1 and 100
                message.channel.send(`${message.author.username} rolls \`${Math.floor(Math.random() * 100) + 1}\`!`);
            }
            return;
        }
        catch (error)
        {
            console.log(error);
            message.channel.send(`Something happened!\n\`\`\`\n${error}\n\`\`\``) // send error as message
        }
    }
};