const sheet = require("../sheet.js");

module.exports.run = async (message, args, client) => {
    let tourney;
    if (args.length == 0) tourney = statObj.tournaments.find(t => t.server_id == message.guild.id);
    else tourney = statObj.tournaments.find(t => t.server_id == args[0] || t.acronym.toLowerCase() == args[0].toLowerCase());
    if (!tourney || !tourney.admins.includes(message.author.id)) return;

    let data = await sheet.loadUsers(tourney.sheet_id, tourney.sheet_page, tourney.sheet_filter, tourney.outside, true);
    if (data.error) return message.reply(data.error);
    let users = data.result;

    let guild = client.guilds.cache.get(tourney.server_id);
    let roles = [];
    tourney.rolename.forEach(role => {
        let role_ = guild.roles.cache.find(r => r.name === role);
        if (!role_) return message.reply(`role **${role}** not found.`);
        roles.push(role_);
    });
    if (roles.length == 0) return;

    let roleRemoved = [];
    users.forEach(user => {
        let name = user.discord.split("#")[0].trim();
        let disc = user.discord.split("#")[1].trim();
        let foundUser = client.users.cache.find(u => u.username.toLowerCase() === name.toLowerCase() && u.discriminator === disc);
        if (!foundUser) foundUser = client.users.cache.find(u => u.username.toLowerCase() === name.toLowerCase()); // try without discriminator
        if (!foundUser) foundUser = client.users.cache.find(u => u.username.toLowerCase() === user.username.toLowerCase()); // try with osu username
        if (!foundUser) foundUser = guild.members.cache.find(u => u.nickname && u.nickname.toLowerCase() === user.username.toLowerCase()); // try with nickname

        if (foundUser) {
            let member = guild.member(foundUser);
            if (member) {
                if (member.roles.cache.has(roles[user.tier - 1].id)) {
                    member.roles.remove(roles[user.tier - 1]).catch(err => { return console.error(err); });
                    return roleRemoved.push(user);
                }
                else return;
            }
            else return;
        }
        else return;
    });

    let removetext = `${roleRemoved.length > 0 ? `**Role removed from following user${roleRemoved.length == 1 ? "" : "s"}: (${roleRemoved.length})**\n\`${roleRemoved.map(u => u.username).sort((a, b) => { return a.localeCompare(b, 'en', { 'sensitivity': 'base' }); }).join(`\`, \``)}\`` : ""}`;

    return message.channel.send(removetext.length == 0 ? "nothing happened" : removetext);
};

module.exports.help = {
    name: "removeroles",
    category: "sys"
}