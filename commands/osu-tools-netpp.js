const config = require("../config.json");
const fetch = require('node-fetch');
const Discord = require('discord.js');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports.run = async (message, args) => {
    try {
        var mode = 0

        if (!args || args.length < 1) return message.channel.send(`Correct usage: \`${config.prefix}netpp [<username>] <raw pp> [<taiko/ctb/mania>]\``);
        else if (args.length <= 1) {
            var ppraw = args[0];

            let found;
            for (var i = 0; i < statObj.users.length; i++) {
                if (statObj.users[i].discord == message.author.id) {
                    uid = statObj.users[i].osu_id;
                    found = true;
                    break;
                }
            }
            if (!found) return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${config.prefix}osuset <user>\`.`)
        }
        else if (args.length <= 2) {
            var uid = args[0];
            var ppraw = args[1];
        }
        else if (args.length <= 3) {
            var uid = args[0];
            var ppraw = args[1];
            if (args[2] == "taiko") mode = 1;
            else if (args[2] == "ctb") mode = 2;
            else if (args[2] == "mania") mode = 3;
        }
        else return;

        var apikey = config.apikey;

        // declare the variables
        var scores = [];
        var scoresoldw = [];
        var weighedscores = [];

        var bottomscore = 0;

        var totalppold = 0;
        var totalpp = 0;
        var difference = 0;
        var newpp = 0;

        var diffsymbol = "";
        var differencerounded = 0;

        // adjust the gamemode

        // get the top 100 plays from the api
        fetch(`https://osu.ppy.sh/api/get_user_best?k=${apikey}&m=${mode}&limit=100&u=${uid}`).then(function (response) {
            return response.json();
        }).then(function (rawjson) {

            // add the pp values of the plays to an array
            var json_array = rawjson;
            for (var j in json_array) {
                scores[scores.length] = parseFloat(json_array[j].pp);
            }

            // get the lowest score on the list
            bottomscore = parseInt(scores[scores.length - 1]);

            // get user stats
            fetch(`https://osu.ppy.sh/api/get_user?k=${apikey}&m=${mode}&u=${uid}`).then(function (response) {
                return response.json();
            }).then(function (rawjsonuser) {

                // take the total pp
                var json_array_user = rawjsonuser;
                for (var ju in json_array_user) {
                    var ppfull = json_array_user[ju].pp_raw;
                    var username = json_array_user[ju].username;
                    uid = json_array_user[ju].user_id;
                    var country = json_array_user[ju].country;
                    var oldrank = json_array_user[ju].pp_rank;
                }

                // see if the inputted pp is below the lowest score
                if (scores.length >= 100 && ppraw < scores[scores.length - 1]) {
                    message.reply(`play outside your top 100 plays. Your lowest play is ${bottomscore}pp.`)
                }
                else {
                    // apply weighting to the old scores and insert them to a new list
                    var i = 1;
                    for (var score in scores) {
                        scoresoldw[scoresoldw.length] = scores[i - 1] * Math.pow(0.95, i - 1);
                        i++;
                    }
                    scores.pop();

                    // add the hypothetical play to the list and sort it
                    scores[scores.length] = ppraw;
                    scores.sort((a, b) => b - a);

                    // apply weighting again with the new score in place
                    var ii = 1;
                    for (var score in scores) {
                        weighedscores[weighedscores.length] = scores[ii - 1] * Math.pow(0.95, ii - 1);
                        ii++;
                    }

                    // sum the score arrays
                    totalppold = scoresoldw.reduce((a, b) => a + b, 0);
                    totalpp = weighedscores.reduce((a, b) => a + b, 0);

                    // calculate difference between the arrays and add it to the total pp
                    difference = parseFloat(totalpp) - parseFloat(totalppold);
                    newpp = parseFloat(ppfull) + parseFloat(difference);

                    // change the +/- symbol
                    if (difference < 0.005 && difference > -0.005) { diffsymbol = "±"; }
                    else if (difference >= 0.005) { diffsymbol = "+"; }
                    else { diffsymbol = ""; }

                    differencerounded = Math.round(difference * 100) / 100;

                    var newrank;
                    var flagurl = `https://osu.ppy.sh/images/flags/${country.toUpperCase()}.png`;

                    xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function () {
                        if (this.readyState == 4 && this.status == 200) {
                            if (done) return;
                            newrank = this.responseText
                            clearTimeout(dead);

                            const statEmbed = new Discord.RichEmbed()
                                .setAuthor(username, flagurl, url = `https://osu.ppy.sh/u/${uid}`)
                                .setColor('#ff007a')
                                .setThumbnail(`https://a.ppy.sh/${uid}?${+new Date()}`)
                                .setDescription(`**${(Math.round(ppfull * 100) / 100).toLocaleString()}pp** *currently*
                        **${(Math.round(newpp * 100) / 100).toLocaleString()}pp** *after ${(Math.round(ppraw * 100) / 100).toLocaleString()}pp play*
                        **${diffsymbol}${differencerounded}pp** *difference*
                        **#${Math.round(oldrank).toLocaleString()} → #${Math.round(newrank).toLocaleString()}** *rank change*`)
                            return message.channel.send(statEmbed);
                        };
                    };

                    xhttp.open("GET", "https://osudaily.net/data/getPPRank.php?t=pp&v=" + Math.round(newpp) + "&m=" + mode, true);
                    xhttp.send();

                    var dead;
                    var done = false;

                    dead = setTimeout(function () {
                        const statEmbed = new Discord.RichEmbed()
                            .setAuthor(username, flagurl, url = `https://osu.ppy.sh/u/${uid}`)
                            .setColor('#ff007a')
                            .setThumbnail(`https://a.ppy.sh/${uid}?${+new Date()}`)
                            .setDescription(`**${(Math.round(ppfull * 100) / 100).toLocaleString()}pp** *currently*
                        **${(Math.round(newpp * 100) / 100).toLocaleString()}pp** *after ${(Math.round(ppraw * 100) / 100).toLocaleString()}pp play*
                        **${diffsymbol}${differencerounded}pp** *difference*`)
                        done = true;
                        return message.channel.send(statEmbed);
                    }, 5000);
                }

            }).catch(function (error) {
                return console.log(error);
            })

        }).catch(function (error) {
            return console.log(error);
        })
    }
    catch (error) {
        return console.log(error);
    }
};

module.exports.help = {
    name: "netpp",
    description: "Calculate how much a new play would affect your total pp",
    usage: "netpp [<user>] <raw pp> [<taiko/ctb/mania>]",
    example: "netpp shdewz 500",
    category: "osu!"
}