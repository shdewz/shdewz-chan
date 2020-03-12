const config = require("../config.json");

module.exports.run = async (message, args) => {

    var server = servers[message.guild.id];
    if (!server || !server.dispatcher) return message.reply("not currently playing anything!");

    if (server.queue.length > 0 || (server.queue.length > 1 && server.repeat == false)) {
        message.reply(`there are still **${server.queue.length}** video(s) in the queue!\nTo confirm stopping, please react with ✅.`).then(sentMsg => {
            sentMsg.react("✅");

            const filter = (reaction, user) => {
                return reaction.emoji.name === '✅' && user.id === message.author.id;
            };

            const collector = sentMsg.createReactionCollector(filter, { max: 1, time: 10000 });

            collector.on('end', collected => {
                if (collected.size > 0) {
                    return stop(message, server);
                }
                else return message.channel.send("**Queue has not been stopped.**");
            });
        })
    }
    else {
        return stop(message, server);
    }
};

function stop(message, server) {
    var server = servers[message.guild.id];
    if (message.guild.voiceConnection) {
        server.queue = [];
        server.queuestats = [];
        server.dispatcher.end();
        message.channel.send("**Disconnecting...**");
    }
    if (message.guild.connection) message.guild.voiceConnection.disconnect();
    return;
}

module.exports.help = {
    name: "stop",
    aliases: ["end", "disconnect"],
    description: "Stop playing, clear the queue and disconnect the bot",
    category: "Music"
}