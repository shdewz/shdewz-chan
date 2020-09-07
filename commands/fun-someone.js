module.exports.run = async (message, args, client) => {
    var ids = [];
    var members;
    var ping = false;
    let csrole;
    if (message.guild.id == "265497141013643276") csrole = message.member.roles.cache.get("275033417907699713");

    if (args.includes("-ping")) {
        ping = true;
        args.splice(args.indexOf("-ping"), 1);
    }

    if (args.includes("-online")) {
        if (args.includes("-cs") && message.guild.id == "265497141013643276") {
            members = Array.from(message.guild.members.cache.filter(member => member.presence.status !== "offline" && !member.user.bot && member.roles.has(csrole)));
            args.splice(args.indexOf("-cs"), 1);
        }
        else members = Array.from(message.guild.members.cache.filter(member => member.presence.status !== "offline" && !member.user.bot));
        args.splice(args.indexOf("-online"), 1);
    } else {
        if (args.includes("-cs") && message.guild.id == "265497141013643276") {
            members = Array.from(message.guild.members.cache.filter(member => !member.user.bot && member.roles.has(csrole)));
            args.splice(args.indexOf("-cs"), 1);
        }
        else {
            members = Array.from(message.guild.members.cache.filter(member => !member.user.bot));
        }
    }

    members.forEach(member => ids.push(member[0]));

    var user = client.users.cache.get(ids[Math.floor(Math.random() * ids.length)]);

    message.channel.send(`${ping ? user : message.guild.member(user).displayName} ${args.join(" ")}`);
}

module.exports.help = {
    name: "someone",
    description: "ping someone.\n\`-online\` gets only online users, \`-ping\` to actually ping.",
    category: "Fun"
}