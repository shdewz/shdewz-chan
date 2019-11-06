const Discord = require('discord.js');

const { prefix, token, apikey } = require('../config.json');
const index = require("../index.js");
const fetch = require("node-fetch");
const client = new Discord.Client();

var mods = ["NF", "EZ", "TD", "HD", "HR", "SD", "DT", "RX", "HT", "NC", "FL", "AT", "SO", "AP", "PF", "K4", "K5", "K6", "K7", "K8", "FI", "RD", "CN", "TP", "K9", "CO", "K1", "K3", "K2", "V2", "MR"];

function getStats(message, args)
{
    try
    {
        var score_pp = [];
        var score_date = [];
        var score_rank = [];
        var score_mods = [];

        var score_map_artist = [];
        var score_map_title = [];
        var score_map_difficulty = [];

        var uid = args[2];
        var mode;
        var gamemode;

        var modtext;
        var mod_binary;
        var mod_chars;

        if (args[3])
        {
            switch (args[3].toLowerCase())
            {
                case "taiko": mode = 1; gamemode = "taiko"; break;
                case "catch": mode = 2; gamemode = "catch the beat"; break;
                case "mania": mode = 3; gamemode = "mania"; break;
                default:
                    message.channel.send(`Unrecognized gamemode \`${args[3]}\`\nUse \`taiko\`, \`catch\`, \`mania\` or leave empty for standard.`);
                    return;
            }
        }
        else { mode = 0; gamemode = "standard"; }

        // get user stats
        const userStatRequest = async () =>
        {
            const response = await fetch(`https://osu.ppy.sh/api/get_user?k=${apikey}&m=${mode}&u=${uid}`);
            const userjson = await response.json();

            for (var u in userjson)
            {
                // put stuff to variables
                var username = userjson[u].username;
                var userid = userjson[u].user_id;
                var joindate = new Date(userjson[u].join_date);
                var playcount = userjson[u].playcount;
                var pp = userjson[u].pp_raw;
                var rank = userjson[u].pp_rank;
                var countryrank = userjson[u].pp_country_rank;
                var country = userjson[u].country;
                var accuracy = userjson[u].accuracy;
                var score = userjson[u].ranked_score;
            }

            const scoreRequest = async () =>
            {
                const response = await fetch(`https://osu.ppy.sh/api/get_user_best?k=${apikey}&m=${mode}&limit=5&u=${uid}`);
                const scorejson = await response.json();

                for (var j in scorejson)
                {
                    // add things to arrays
                    score_pp[score_pp.length] = parseFloat(scorejson[j].pp);
                    score_date[score_date.length] = new Date(scorejson[j].date);
                    score_rank[score_rank.length] = scorejson[j].rank;

                    // get the mods
                    // this is probably the most retarded and inefficient way to do this

                    modtext = "";

                    // convert to binary and reverse
                    mod_binary = ((scorejson[j].enabled_mods >>> 0).toString(2)).split("").reverse().join("");
                    if (mod_binary != 0)
                    {
                        // split to separate 1s and 0s
                        mod_chars = mod_binary.split("");

                        // if 1 then add appropriate mod to the text
                        for (var c in mod_chars)
                        {
                            if (mod_chars[c] == 1)
                            {
                                modtext += mods[c];
                            }
                        }

                        // remove unnecessary DT and/or SD if NC and PF are present
                        if (modtext.toUpperCase().includes('NC') || modtext.toUpperCase().includes('PF'))
                        {
                            modtext = modtext.replace(/DT/gi, "");
                            modtext = modtext.replace(/PF/gi, "");
                        }

                        score_mods[score_mods.length] = ` (+${modtext})`;
                    }
                    else
                    {
                        modtext = "NM";
                        score_mods[score_mods.length] = ``;
                    }
                }

                // get profile picture
                var avatarurl = `https://a.ppy.sh/${userid}`;

                // display stuff
                const statEmbed = new Discord.RichEmbed()
                    .setColor('#ff007a')
                    .setTitle(`osu! stats for **${username}** :flag_${country.toLowerCase()}:`)
                    .setDescription(`*${gamemode} gamemode*`)
                    .setThumbnail(avatarurl)
                    .addField("Basic stats:", `\`\`\`xl\n#${ac(rank)} (#${ac(countryrank)} ${country})\n${ac(Math.round(pp))} pp\n${ac(playcount)} plays\n${Math.round(accuracy * 100) / 100}% accuracy\n${as(score)} ranked score\n\nJoined ${formatDate(joindate)}\n${ac(timeSince(joindate))}\`\`\``)
                    .addField("Top plays:", `\`\`\`xl\n${ac(Math.round(score_pp[0]))} pp${score_mods[0]} / ${ac(timeSince(score_date[0]))}\n${ac(Math.round(score_pp[1]))} pp${score_mods[1]} / ${ac(timeSince(score_date[1]))}\n${ac(Math.round(score_pp[2]))} pp${score_mods[2]} / ${ac(timeSince(score_date[2]))}\n${ac(Math.round(score_pp[3]))} pp${score_mods[3]} / ${ac(timeSince(score_date[3]))}\n${ac(Math.round(score_pp[4]))} pp${score_mods[4]} / ${ac(timeSince(score_date[4]))}\`\`\``)
                //.setFooter(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
                message.channel.send(statEmbed);
            }
            scoreRequest();
        }
        userStatRequest();
    }
    catch (error)
    {
        console.log(error);
        console.log("ded");
        message.channel.send("something went wrong :-(");
    }
}

// add comma as thousand separator
function ac(num)
{
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

// add large number suffixes
function as(num)
{
    if (num <= 100000)
    {
        return ac(num);
    }
    else if (num <= 1000000)
    {
        num /= 1000;
        return ac(Math.round(num * 10) / 10) + "k";
    }
    else if (num <= 100000000)
    {
        num /= 1000000;
        return ac(Math.round(num * 10) / 10) + "M";
    }
    else if (num <= 1000000000)
    {
        num /= 1000000;
        return ac(Math.round(num)) + "M";
    }
    else if (num <= 100000000000)
    {
        num /= 1000000000;
        return ac(Math.round(num * 100) / 100) + "B";
    }
    else if (num <= 1000000000000)
    {
        num /= 1000000000;
        return ac(Math.round(num * 10) / 10) + "B";
    }
    else
    {
        num /= 1000000000;
        return ac(Math.round(num)) + "B";
    }
}

// new time calc
function timeSince(past)
{
    var suffix;
    var prefix;
    var today = new Date();
    var timeDiff = today - past;
    var dayDiff = timeDiff / (1000 * 3600 * 24);
    var monthDiff = dayDiff / (365.2422 / 12);
    var yearDiff = dayDiff / 365.2422;

    if (dayDiff < 365.2422 / 12)
    {
        if (Math.round(dayDiff) == 1) { suffix = " day ago"; }
        else { suffix = " days ago"; }
        prefix = "";
        return prefix + Math.round(dayDiff) + suffix;
    }
    else if (dayDiff < 365.2422)
    {
        if (Math.round(monthDiff) == 1) { suffix = " month ago"; }
        else { suffix = " months ago"; }
        prefix = "";
        return prefix + Math.round(monthDiff) + suffix;
    }
    else if (dayDiff >= 365.2422)
    {
        if (Math.round(yearDiff * 10) / 10 == 1) { suffix = " year ago"; }
        else { suffix = " years ago"; }
        prefix = "";
        return prefix + Math.round(yearDiff * 10) / 10 + suffix;
    }
    else
    {
        return "<date calc error>";
    }
}

// format the date to mm/dd/yyyy
function formatDate(value)
{
    return value.getMonth() + 1 + "/" + value.getDate() + "/" + value.getFullYear();
}

/*
function getMaps(callback)
{
    const request = async () =>
    {
        const response = await fetch(`https://osu.ppy.sh/api/get_beatmaps?k=${apikey}&b=${map_id}`);
        const mapjson = await response.json();
        //console.log(json);
        callback(mapjson);
    }
    request();
}

function returnMaps(maps)
{
    return maps;
}
*/

module.exports.stats = getStats;

client.login(token);