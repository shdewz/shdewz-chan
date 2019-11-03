const Discord = require('discord.js');

const { prefix, token, apikey } = require('../config.json');
const index = require("../index.js");
const fetch = require("node-fetch");
const client = new Discord.Client();

function getStats(message, args)
{
    
    try
    {
        var uid = args[1];
        var mode;
        var gamemode;
        if (args[2])
        {
            switch (args[2].toLowerCase())
            {
                case "taiko": mode = 1; gamemode = "taiko"; break;
                case "ctb": mode = 2; gamemode = "ctb"; break;
                case "mania": mode = 3; gamemode = "mania"; break;
            }
        }
        else { mode = 0; gamemode = "standard"; }

        // get user stats
        fetch(`https://osu.ppy.sh/api/get_user?k=${apikey}&m=${mode}&u=${uid}`).then(function (response)
        {
            return response.json();
        }).then(function (rawjsonuser)
        {
            // extract stats from the json
            var json_array_user = rawjsonuser;
            for (var j in json_array_user)
            {
                var username = json_array_user[j].username;
                var userid = json_array_user[j].user_id;
                var joindate = json_array_user[j].join_date;
                var playcount = json_array_user[j].playcount;
                var pp = json_array_user[j].pp_raw;
                var rank = json_array_user[j].pp_rank;
                var countryrank = json_array_user[j].pp_country_rank;
                var country = json_array_user[j].country;
                var accuracy = json_array_user[j].accuracy;
            }

            // get profile picture
            var avatarurl = `https://a.ppy.sh/${userid}`;

            // display stuff
            const statEmbed = new Discord.RichEmbed()
                .setColor('#ff007a')
                .setTitle(`**${username}**'s osu! stats (${gamemode})`)
                .setThumbnail(avatarurl)
                .addBlankField()
                .addField("user:", `${username} :flag_${country.toLowerCase()}:`)
                .addField("pp:", `${Math.round(pp)}pp`)
                .addField("rank:", `#${rank} (#${countryrank} ${country})`)
            message.channel.send(statEmbed);
        })
    }
    catch(error)
    {
        console.log(error);
        console.log("ded");
        message.channel.send("something went wrong :-(");
    }
    
}

module.exports.stats = getStats;

client.login(token);