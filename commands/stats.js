const config = require("../config.json");
const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports = {
    name: 'stats',
    description: `Displays a user's osu! stats.`,
    execute(message, args, stat, player)
    {
        try
        {
            // use server nick if no arguments given
            if (player != undefined) convertedName = player;
            else if (args.length < 1) convertedName = message.member.displayName.split(" ").join('_');
            else convertedName = args.join('_');

            var playerstatus = `Not playing`;
            var playerfound = false;
            var badges = 0;
            var rankText = "Rank"; // because too lazy for lots of if statements

            // check the player's tourney status
            while (!playerfound)
            {
                // check if player
                for (var i = 0; i < stat.players.length; i++) // go through the list
                {
                    if (stat.players[i].name.toLowerCase() == convertedName.toLowerCase()) // see if name exists in captains list
                    {
                        badges = stat.players[i].badges;
                        rankText = "BWS Rank"
                        playerstatus = `Player`;
                        playerfound = true;
                        break;
                    }
                }
                // check if captain
                for (var i = 0; i < stat.captains.length; i++) // go through the list
                {
                    if (stat.captains[i].name.toLowerCase() == convertedName.toLowerCase()) // see if name exists in captains list
                    {
                        playerstatus = `Captain`;
                        playerfound = true;
                        break;
                    }
                }
                playerfound = true;
                break;
            }

            // get user stats
            const userStatRequest = async () =>
            {
                const response = await fetch(`https://osu.ppy.sh/api/get_user?k=${config.apikey}&m=0&u=${convertedName}`);
                const userjson = await response.json();

                for (var u in userjson)
                {
                    // put stuff to variables
                    var username = userjson[u].username;
                    var userid = userjson[u].user_id;
                    var playcount = userjson[u].playcount;
                    var pp = Math.round(userjson[u].pp_raw);
                    var rank = userjson[u].pp_rank;
                    var country = userjson[u].country;
                    var accuracy = Math.round(userjson[u].accuracy * 100) / 100;
                }

                var bws_rank = Math.round(Math.pow(rank, Math.pow(0.9921, (badges * (badges + 1) / 2))));

                // get profile picture and flag
                var avatarurl = `https://a.ppy.sh/${userid}`;
                var flagurl = `https://osu.ppy.sh/images/flags/${country.toUpperCase()}.png`;

                // display stuff
                const statEmbed = new Discord.RichEmbed()
                    .setAuthor(username, flagurl, url = `https://osu.ppy.sh/u/${userid}`)
                    .setColor('#ff007a')
                    .setThumbnail(avatarurl)
                    .setDescription(`*⯈ ${rankText}:*  **#${ac(bws_rank)}**\n*⯈ pp:*  **${ac(pp)}**\n*⯈ Accuracy:*  **${accuracy}%**\n*⯈ Playcount:*  **${ac(playcount)}**\n\n*⯈ Tournament Status:*  **${playerstatus}**`)
                message.channel.send(statEmbed);

            }
            return userStatRequest();
        }
        catch (error)
        {
            console.log(error);
            return message.channel.send(`Something happened!\n\`\`\`\n${error}\n\`\`\``); // send error as message
        }
    }
};

// add comma as thousand separator
function ac(num)
{
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}