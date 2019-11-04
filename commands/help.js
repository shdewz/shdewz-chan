const Discord = require('discord.js');

const { prefix, token } = require('../config.json');
const client = new Discord.Client();

function mainHelp(message)
{
    const mainHelpEmbed = new Discord.RichEmbed()
        .setColor('#ff007a')
        .setTitle('**Help page**')
        .setAuthor('shdewz-chan', 'https://i.imgur.com/2uotbfK.png')
        .setDescription('Here is a list of the few working commands.\n\`<>\` indicate a user-defined value. Values inside \`[]\` are optional.')
        .addBlankField()
        .addField(`\`${prefix}help [<osu>]\``, '- Opens a help page for the specified category')
        .addField(`\`${prefix}roll [<value>]\``, '- Returns a random integer between 1 and a given value (default 100)')
        .addField(`\`${prefix}rroulette [start] [abort] [<bullets>] [<chambers>]\``, '- Plays a game of russian roulette. Default values are 1/6.')
        .addField(`\`${prefix}play <video>\``, `- Joins a voice channel and plays a YouTube video or adds it to the queue.\n- \`${prefix}stop\` and \`${prefix}skip\` can be used.`)
    message.channel.send(mainHelpEmbed);
    return;
}

function osuHelp(message)
{
    const osuHelpEmbed = new Discord.RichEmbed()
        .setColor('#ff007a')
        .setTitle('**?osu help page**')
        .setAuthor('shdewz-chan', 'https://i.imgur.com/2uotbfK.png')
        .setDescription('Help page for the ?osu commands.\n\`<>\` indicate a user-defined value. Values inside \`[]\` are optional.')
        .addBlankField()
        .addField(`\`${prefix}osu stats <user> [<taiko/catch/mania>]\``, '- Displays stats for the specified user')
        .addField(`\`${prefix}osu newplay <user> [<value>] [<replace>]\``, `- Shows change in total pp after a theoretical play.\n- \`value\` is the pp value of the new play.\n- Use \`replace\` (# in your top plays) if the play overwrites another\n- (!) WIP - DOESN'T WORK (!)`)
    message.channel.send(osuHelpEmbed);
    return;
}
module.exports.osuhelp = osuHelp;
module.exports.mainhelp = mainHelp;

client.login(token);