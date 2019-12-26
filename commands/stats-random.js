module.exports.run = async (client, message, args) =>
{
    try
    {
        var stat = client.commands.get("loadstats").run(); // load stats

        var rng = Math.floor(Math.random() * stat.players.length);
        player = stat.players[rng].name;

        client.commands.get("stats").run(client, message, args, player);
    }
    catch (error)
    {
        console.log(error);
        return message.channel.send(`Something happened!\n\`\`\`\n${error}\n\`\`\``); // send error as message
    }
};

module.exports.help = {
    name: "stats.random"
}