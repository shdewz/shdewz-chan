const sheet = require("../sheet.js");

module.exports.run = async (message, args, client) => {
    let tourney;
    if (args.length == 0) tourney = statObj.tournaments.find(t => t.server_id == message.guild.id);
    else tourney = statObj.tournaments.find(t => t.server_id == args[0] || t.acronym.toLowerCase() == args[0].toLowerCase());
    if (!tourney || !tourney.admins.includes(message.author.id)) return;

    let data = await sheet.loadUsers(tourney.sheet_id, tourney.sheet_page, tourney.sheet_filter, tourney.outside, false);
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

    let notFound = [];
    let roleGiven = [];
    let already = [];
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
                if (!member.roles.cache.has(roles[user.tier - 1].id)) {
                    member.roles.add(roles[user.tier - 1]).catch(err => { return console.error(err); });
                    return roleGiven.push(user);
                }
                else return already.push(user);
            }
            else return notFound.push(user);
        }
        else return notFound.push(user);
    });

    let alreadytext = `${already.length > 0 ? `**${already.length} user${already.length == 1 ? "" : "s"} already had the role.**` : ""}`;

    let giventext = `${roleGiven.length > 0 ? `**Role given to following user${roleGiven.length == 1 ? "" : "s"}: (${roleGiven.length})**\n\`${roleGiven.map(u => u.username).sort((a, b) => { return a.localeCompare(b, 'en', { 'sensitivity': 'base' }); }).join(`\`, \``)}\`` : ""}`;

    let failedtext = `${notFound.length > 0 ? `**Following user${notFound.length == 1 ? "" : "s"} not found in the server: (${notFound.length})**\n\`${notFound.map(u => u.username).sort((a, b) => { return a.localeCompare(b, 'en', { 'sensitivity': 'base' }); }).join(`\`, \``)}\`` : ""}`;

    let finaltext = (alreadytext.length == 0 && giventext.length == 0 && failedtext.length == 0) ? "nothing happened" : `${giventext}\n\n${failedtext}\n\n${alreadytext}`;

    return message.channel.send(finaltext);
};

module.exports.help = {
    name: "addroles",
    category: "sys"
}