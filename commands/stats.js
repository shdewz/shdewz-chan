const config = require("../config.json");
const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports.run = async (client, message, args, player) =>
{
    try
    {
        var stat = client.commands.get("loadstats").run(); // load stats

        findPlayer:
        if (typeof player !== "undefined") convertedName = player;
        else if (args.length < 1)
        {
            for (var i = 0; i < stat.captains.length; i++)
            {
                if (stat.captains[i].dc == message.author.id)
                {
                    convertedName = stat.captains[i].name;
                    break findPlayer;
                }
            }
            for (var i = 0; i < stat.players.length; i++)
            {
                if (stat.players[i].dc == message.author.id)
                {
                    convertedName = stat.players[i].name;
                    break findPlayer;
                }
            }
            return message.reply(`your account doesn't seem to be linked yet. Do \`${config.prefix}set <username>\` to link it.`);
        }

        else convertedName = args.join('_');

        var playerstatus = `Not playing`;
        var playerfound = false;
        var badges = 0;
        var story = "";

        // check the player's tourney status
        while (!playerfound)
        {
            // check if player
            for (var i = 0; i < stat.players.length; i++) // go through the list
            {
                if (stat.players[i].name.toLowerCase() == convertedName.toLowerCase()) // see if name exists in captains list
                {
                    badges = stat.players[i].badges;
                    playerstatus = `Player`;
                    story = `\n*⯈ Pickup line:* **${stat.players[i].story}**`;
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
                    badges = parseInt(stat.captains[i].badges);
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
                var playcount = parseInt(userjson[u].playcount);
                var pp = Math.round(userjson[u].pp_raw);
                var rank = parseInt(userjson[u].pp_rank);
                var country = userjson[u].country;
                var accuracy = Math.round(userjson[u].accuracy * 100) / 100;
            }

            var bws_rank = Math.round(Math.pow(parseInt(rank), Math.pow(0.9921, (parseInt(badges) * (parseInt(badges) + 1) / 2))));

            // get profile picture and flag
            var avatarurl = `https://a.ppy.sh/${userid}`;
            var flagurl = `https://osu.ppy.sh/images/flags/${country.toUpperCase()}.png`;

            // display stuff
            if (playerstatus == "Player" || playerstatus == "Captain")
            {
                const statEmbed = new Discord.RichEmbed()
                    .setAuthor(username, flagurl, url = `https://osu.ppy.sh/u/${userid}`)
                    .setColor('#ff007a')
                    .setThumbnail(avatarurl)
                    .setDescription(`*⯈ BWS:*  **#${bws_rank.toLocaleString()}** *(${badges} badges)*\n*⯈ pp:*  **${pp.toLocaleString()}pp**\n*⯈ Accuracy:*  **${accuracy}%**\n*⯈ Playcount:*  **${playcount.toLocaleString()}**\n\n*⯈ Tournament Status:*  **${playerstatus}**${story}`)
                message.channel.send(statEmbed);
            }
            else
            {
                const statEmbed = new Discord.RichEmbed()
                    .setAuthor(username, flagurl, url = `https://osu.ppy.sh/u/${userid}`)
                    .setColor('#ff007a')
                    .setThumbnail(avatarurl)
                    .setDescription(`*⯈ Rank:*  **#${bws_rank.toLocaleString()}**\n*⯈ pp:*  **${pp.toLocaleString()}**\n*⯈ Accuracy:*  **${accuracy}%**\n*⯈ Playcount:*  **${playcount.toLocaleString()}**\n\n*⯈ Tournament Status:*  **${playerstatus}**`)
                message.channel.send(statEmbed);
            }
        }
        return userStatRequest();
    }
    catch (error)
    {
        console.log(error);
        return message.channel.send(`Something happened!\n\`\`\`\n${error}\n\`\`\``); // send error as message
    }
};

module.exports.help = {
    name: "stats"
}