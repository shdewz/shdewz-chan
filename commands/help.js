const Discord = require('discord.js');

const { prefix, token } = require('../config.json');
const client = new Discord.Client();

function Help(message, args)
{
    const helpEmbed = new Discord.RichEmbed()
        .setColor('#ff007a')
        .setTitle('**Help page**')
        .setAuthor('shdewz-chan', 'https://i.imgur.com/2uotbfK.png')
        .setDescription('Here is a list of the few working commands.\n\`<>\` indicate a user-defined value. Values inside \`[]\` are optional.')
        .addBlankField()
        .addField(`\`${prefix}help\``, '- Opens this help page')
        .addField(`\`${prefix}roll [<value>]\``, '- Returns a random integer between 1 and a given value (default 100)')
        .addField(`\`${prefix}rroulette [start] [abort] [<bullets>] [<chambers>]\``, '- Plays a game of russian roulette. Default values are 1/6.')
        .addField(`\`${prefix}play <video>\``, `- Joins a voice channel and plays a YouTube video or adds it to the queue.\n- \`${prefix}stop\` and \`${prefix}skip\` can be used.`)
        .addField(`\`${prefix}osu <username/id> [<taiko/catch/mania>]\``, `- Displays stats for specified osu! account.`)
    message.channel.send(helpEmbed);
    return;
}
module.exports.help = Help;

client.login(token);