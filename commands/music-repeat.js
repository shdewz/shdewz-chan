module.exports.run = async (message, args) => {

    var server = servers[message.guild.id];
    if (!server || !server.dispatcher) return message.reply("not currently playing anything!");
    if (!server.now) return message.reply("not currently playing anything!");

    if (!server.repeat) {
        server.repeat = true;

        let embed = {
            color: 0xe84393,
            author: {
                name: `Repeat turned on!`
            }
        }

        return message.channel.send({ embed: embed });
    }
    else {
        server.repeat = false;

        let embed = {
            color: 0xe84393,
            author: {
                name: `Repeat turned off!`
            }
        }

        return message.channel.send({ embed: embed });
    }
};

module.exports.help = {
    name: "repeat",
    aliases: ["loop"],
    description: "Plays the current song on repeat.",
    category: "Music"
}