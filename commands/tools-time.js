const moment = require("moment");

module.exports.run = async (message, args) => {
    var now = moment.utc(new Date());

    var time = now.format("HH:mm:ss");
    var date = now.format("dddd, MMMM Do, YYYY");

    var detailed = now.format("DDDo [day of the year / Week] w");

    let embed = {
        color: 0xe84393,
        description: `**${time} UTC**
            ${date}
            ${detailed}`
    }
    return message.channel.send({ embed: embed });
};

module.exports.help = {
    name: "time",
    aliases: ["utc"]
}