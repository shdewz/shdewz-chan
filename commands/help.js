const config = require("../config.json");
const Discord = require('discord.js');

module.exports.run = async (client, message, args) =>
{
    const helpEmbed = new Discord.RichEmbed()
        .setColor('#ff007a')
        .setTitle('shdewz-chan commands')
        .setDescription(`\`${config.prefix}set <username>\` connects discord to osu! username
        \`${config.prefix}unlink\` reverts the above
        \`${config.prefix}mp <mplink>\` sets qualifier mp link visible
        \`${config.prefix}stats\` displays osu! stats
        \`${config.prefix}stats.random\` displays someone's osu! stats
        \`${config.prefix}me\` displays your tourney info
        \`${config.prefix}players.list [<-p <page>>] [<name>]\` displays player list or info about someone
        \`${config.prefix}captains.list [<name>]\` displays captain list or info about someone
        \`${config.prefix}money\` displays your money
        \`${config.prefix}roll\` rolls
        \`${config.prefix}players.sold\` displays sold players
        \`${config.prefix}select-a-gamer [<amount>]\` selects a gamer`)
    message.channel.send(helpEmbed);
};

module.exports.help = {
    name: "help"
}