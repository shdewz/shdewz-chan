module.exports.run = async (message, args, client) => {
    var ids = [];
    var members;
    var ping = false;

    if (args.includes("-ping")) {
        ping = true;
        args.splice(args.indexOf("-ping"), 1);
    }

    if (args.includes("-online")) {
        members = Array.from(message.guild.members.filter(member => member.presence.status !== "offline" && !member.user.bot));
        args.splice(args.indexOf("-online"), 1);
    } else members = Array.from(message.guild.members.filter(member => !member.user.bot));

    members.forEach(member => ids.push(member[0]));

    var user = client.users.get(ids[Math.floor(Math.random() * ids.length)]);

    message.channel.send(`${ping ? user : message.guild.member(user).displayName} ${args.join(" ")}`);
}

module.exports.help = {
    name: "someone",
    description: "ping someone.\n\`-online\` gets only online users, \`-ping\` to actually ping.",
    category: "Fun"
}