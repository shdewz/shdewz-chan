const Discord = require('discord.js');
const config = require("../config.json");

module.exports.run = async (client, message, args) => {
    var stat = client.commands.get("loadstats").run(); // load stats
    var mplink;

    if (args.length >= 1 && !args.includes("-p")) // single player
    {
        for (var i = 0; i < stat.players.length; i++) {
            if (stat.players[i].name.toLowerCase() == args[0].toLowerCase()) {
                if (typeof stat.players[i].mp !== "undefined" && stat.players[i].mp != "") mplink = `<${stat.players[i].mp}>`;
                else mplink = "N/A";
                // player is sold
                if (stat.players[i].sold != " - ") {
                    for (var j = 0; j < stat.sold.length; j++) {
                        if (stat.sold[j].name == stat.players[i].name) {
                            var owner = stat.sold[j].owner;
                            var price = stat.sold[j].price;
                        }
                    }
                    return message.channel.send(`**Player name:** ${stat.players[i].name.replace(/([_*~])/g, "\\$1")}\n**Pickup line:** ${stat.players[i].story}\n**MP Link:** ${mplink}\n**Sold?** Yes, to ${owner} for ${price} ${config.currency}`);
                }
                else {
                    return message.channel.send(`**Player name:** ${stat.players[i].name.replace(/([_*~])/g, "\\$1")}\n**Pickup line:** ${stat.players[i].story}\n**MP Link:** ${mplink}\n**Sold?** No`);
                }
            }
        }
    }
    else {
        if (stat.players.length == 0) return message.channel.send(`Player list is probably empty.`);
        else {
            var plrListTextNames = "";
            var plrListTextSold = "";
            var plrListMPLinks = "";

            var pageStart;
            var pageEnd;
            var pages = Math.ceil(stat.players.length / 50)
            var page;

            if (args.includes("-p") && !isNaN(args[args.length - 1])) {
                page = args[args.length - 1];
                if (args[args.length - 1] > pages) return message.channel.send(`Not enough pages.`);
                pageStart = 50 * (page - 1);
                pageEnd = 50 + (50 * (page - 1));
            }
            else {
                page = 1;
                pageStart = 0;
                pageEnd = 50;
            }

            if (pageEnd > stat.players.length) pageEnd = stat.players.length;

            for (var i = pageStart; i < pageEnd; i++) {
                plrListTextNames += `${stat.players[i].name.replace(/([_*~])/g, "\\$1")}\n`;
                plrListTextSold += `${stat.players[i].sold}\n`;
                if (stat.players[i].mp && stat.players[i].mp != "") plrListMPLinks += `[mp link](${stat.players[i].mp})\n`;
                else plrListMPLinks += `-\n`;
            }

            if (plrListTextNames == "") {
                message.channel.send(`Player list is probably empty.`);
                return;
            }

            const playerListEmbed = new Discord.RichEmbed()
                .setColor('#ff007a')
                .setTitle(`**Current players** (${stat.players.length})`)
                .setDescription(`*Page ${page} of ${pages}*`)
                .addField('*Name*', plrListTextNames, true)
                .addField('*Sold?*', plrListTextSold, true)
                .addField('*mp link*', plrListMPLinks, true)
            message.channel.send(playerListEmbed);
            return;
        }
    }
};

module.exports.help = {
    name: "players.list"
}