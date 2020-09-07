module.exports.run = async (message, args, client) => {
    let seconds = Math.floor(process.uptime()) + 50;

    let days = seconds / (60 * 60 * 24) >= 1 ? Math.floor(seconds / (60 * 60 * 24)) : 0;
    if (days > 0) seconds = seconds - (days * 24 * 60 * 60);
    let days_s = days == 1 ? "" : "s";

    let hours = seconds / (60 * 60) >= 1 ? Math.floor(seconds / (60 * 60)) : 0;
    if (hours > 0) seconds = seconds - (hours * 60 * 60);
    let hours_s = hours == 1 ? "" : "s";

    let minutes = seconds / 60 >= 1 ? Math.floor(seconds / 60) : 0;
    if (minutes > 0) seconds = seconds - (minutes * 60);
    let minutes_s = minutes == 1 ? "" : "s";

    let seconds_ = Math.floor(seconds);
    let seconds_s = seconds == 1 ? "" : "s";

    let daystext = days > 0 ? `**${days}** day${days_s}, ` : "";
    let hourstext = hours > 0 ? `**${hours}** hour${hours_s}, ` : "";
    let minutestext = minutes > 0 ? `**${minutes}** minute${minutes_s}, ` : "";

    let embed = {
        color: message.member.displayColor,
        author: {
            name: `shdewz-chan uptime:`,
            icon_url: client.user.displayAvatarURL()
        },
        description: `${daystext}${hourstext}${minutestext}**${seconds_}** second${seconds_s}`
    }
    return message.channel.send({ embed: embed });
};

module.exports.help = {
    name: "uptime",
    description: "Time since the bot was last started up",
    category: "Tools"
}