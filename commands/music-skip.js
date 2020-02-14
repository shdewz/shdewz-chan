module.exports.run = async (message, args) => {

    var server = servers[message.guild.id];
    var skip = "yes";
    if (!server) return message.reply("not currently playing anything!");
    else if (server.dispatcher) return server.dispatcher.end(skip);
    else return message.reply("not currently playing anything!");
};

module.exports.help = {
    name: "skip"
}