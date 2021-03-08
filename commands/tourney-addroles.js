const sheet = require("../sheet.js");

module.exports.run = async (message, args, client) => {
    let tourney;
    if (args.length == 0) tourney = statObj.tournaments.find(t => t.server_id == message.guild.id);
    else tourney = statObj.tournaments.find(t => t.server_id == args[0] || t.acronym.toLowerCase() == args[0].toLowerCase());
    if (!tourney || !tourney.admins.includes(message.author.id)) return;

    let teams = await sheet.loadUsers(tourney.sheet_id, tourney.sheet_page, tourney.sheet_filter, tourney.teamsize, tourney.outside, false);
    if (teams.error) return message.reply(teams.error);

    let guild = client.guilds.cache.get(tourney.server_id);
    let roles = { captain: getRoles(tourney.captainroles, guild), player: getRoles(tourney.playerroles, guild) };

    if (roles.captain.length == 0 && roles.player.length) return;

    let processed = [];

    teams.forEach(team => {
        team.players.forEach(player => {
            if (!player.discord) return;
            let name = player.discord.split("#")[0].trim();
            let disc = player.discord.split("#")[1].trim();

            let foundUser = client.users.cache.find(u => u.username.toLowerCase() === name.toLowerCase() && u.discriminator === disc);

            // try without discriminator
            if (!foundUser) foundUser = client.users.cache.find(u => u.username.toLowerCase() === name.toLowerCase());

            // try with osu username
            if (!foundUser) foundUser = client.users.cache.find(u => u.username.toLowerCase() === player.username.toLowerCase());

            // try with nickname
            if (!foundUser) foundUser = guild.members.cache.find(u => u.nickname && u.nickname.toLowerCase() === player.username.toLowerCase());

            if (foundUser) {
                let member = guild.member(foundUser);
                if (member) {
                    if (!member.roles.cache.has(roles.player[player.tier - 1].id)) {
                        member.roles.add(roles.player[player.tier - 1]).catch(err => { return console.error(err); });
                        processed.push({ name: player.username, state: "player" });
                    }
                    if (player.captain && !member.roles.cache.has(roles.captain[player.tier - 1].id)) {
                        member.roles.add(roles.captain[player.tier - 1]).catch(err => { return console.error(err); });
                        processed.push({ name: player.username, state: "captain" });
                    }
                }
                else return processed.push({ name: player.username, state: "notfound", c: player.captain });
            }
            else return processed.push({ name: player.username, state: "notfound", c: player.captain });
        });
    });

    let captains = processed.filter(e => e.state == "captain");
    let players = processed.filter(e => e.state == "player");
    let notfound = processed.filter(e => e.state == "notfound");

    let fields = [];

    if (tourney.teamsize > 1) fields.push({
        name: captains.length == 0 ? "No users found with a missing captain role." : `Captain role given to ${captains.length} users.`,
        value: captains.length == 0 ? "\u200b" : captains.map(e => `${e.name}`).join(", ")
    });

    fields.push({
        name: players.length == 0 ? "No users found with a missing player role." : `Player role given to ${players.length} users.`,
        value: players.length == 0 ? "\u200b" : players.map(e => `${e.name}`).join(", ")
    });

    if (notfound.length > 0) fields.push({
        name: notfound.length == 0 ? "No missing players found! (how)" : `${notfound.length} users not found in the server.`,
        value: notfound.length == 0 ? "\u200b" : notfound.sort((a, b) => b.c - a.c).map(e => `${e.name}${e.c ? " (c)" : ""}`).join(", ")
    });

    return message.channel.send({
        embed: {
            color: 0xf56c7c,
            fields: fields,
        }
    });
};

function getRoles(rolenames, guild) {
    let output = [];
    if (rolenames.length > 0) {
        rolenames.forEach(role => {
            let role_ = guild.roles.cache.find(r => r.name === role);
            if (!role_) return console.log(`role **${role}** not found.`);
            output.push(role_);
        });
    }
    return output;
}

module.exports.help = {
    name: "addroles",
    category: "sys"
}