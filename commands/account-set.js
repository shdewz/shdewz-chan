const fs = require("fs");

module.exports.run = async (client, message, args) => {
    if (!args) return;

    var name = args.join("_");
    var id = message.author.id;
    var found = false;

    var stat = client.commands.get("loadstats").run(); // load stats

    // see if captain
    captain:
    for (var i = 0; i < stat.captains.length; i++) {
        if (stat.captains[i].name.split(" ").join("_") == name) {
            if (message.member.roles.some(role => role.name === 'Slave Owner') || message.member.roles.some(role => role.name === 'Aspiring Slave Owner')) {
                if (stat.captains[i].dc) return message.channel.send(`${name} already connected to someone else.`);

                stat.captains[i].dc = id;
                message.channel.send(`Succesfully linked ${message.author} to captain ${name}.`)
                found = true;

                fs.writeFile("stats.json", JSON.stringify(stat), function (err) {
                    if (err) return console.log("error", err);
                    return console.log("Save successful.");
                });
                break captain;
            }

            return message.reply(`insufficient permissions.`);
        }
    }

    // see if player
    player:
    for (var i = 0; i < stat.players.length; i++) {
        if (stat.players[i].name.split(" ").join("_") == name) {
            if (message.member.roles.some(r => r.name === "Slave")) {
                if (stat.players[i].dc) return message.channel.send(`${name} already connected to someone else.`);

                stat.players[i].dc = id;
                message.channel.send(`Succesfully linked ${message.author} to player ${name}.`)
                found = true;

                fs.writeFile("stats.json", JSON.stringify(stat), function (err) {
                    if (err) return console.log("error", err);
                    return console.log("Save successful.");
                });
                break player;
            }

            return message.reply(`insufficient permissions.`);
        }
    }

    if (!found) message.reply(`${name} was not recognized as a captain or player.`);
    return;
}

module.exports.help = {
    name: "set"
}