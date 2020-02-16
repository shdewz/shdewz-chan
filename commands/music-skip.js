module.exports.run = async (message) => {

    var server = servers[message.guild.id];
    if (!server) return message.reply("not currently playing anything!");
    else if (server.dispatcher) return server.dispatcher.end();
    else return message.reply("not currently playing anything!");
};

module.exports.help = {
    name: "skip",
    description: "Skip the current song",
    category: "Music"
}