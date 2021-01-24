const config = require("../config.json");
const fetch = require('node-fetch');
const Discord = require('discord.js');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports.run = async (message, args) => {
    try {
        var mode = 0
        var derank = false;
        var derankpos = 0;
        var uid = "";
        var modes = {
            "osu": 0,
            "taiko": 1,
            "ctb": 2,
            "mania": 3
        }

        if (args.length == 0) return message.channel.send(`Correct usage: \`${config.prefix}netpp [<-u username>] <raw pp> [-o <position>] [<-m taiko/ctb/mania>]\``);
        else {
            if (args.includes("-m")) {
                mode = modes[args[args.indexOf("-m") + 1].toLowerCase()];
                args.splice(args.indexOf("-m"), 2);
            }

            if (args.includes("-o")) {
                derank = true;
                derankpos = args[args.indexOf("-o") + 1]
                args.splice(args.indexOf("-o"), 2);
            }

            if (args.includes("-u")) {
                uid = args[args.indexOf("-u") + 1]
                args.splice(args.indexOf("-u"), 2);
            }

            var ppraw = args.filter(a => !isNaN(a))[0];

            if (uid == "") {
                let found = false;
                for (var i = 0; i < statObj.users.length; i++) {
                    if (statObj.users[i].discord == message.author.id) {
                        uid = statObj.users[i].osu_id;
                        found = true;
                        break;
                    }
                }
                if (!found) return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${config.prefix}osuset <user>\`.`)
            }
        }

        var apikey = config.keys.osu.apikey_old;

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
        }).then(plays => {

            // add the pp values of the plays to an array
            for (var play in plays) {
                scores.push(parseFloat(plays[play].pp));
            }

            // get the lowest score on the list
            bottomscore = parseInt(scores[scores.length - 1]);

            // get user stats
            fetch(`https://osu.ppy.sh/api/get_user?k=${apikey}&m=${mode}&u=${uid}`).then(function (response) {
                return response.json();
            }).then(function (rawjsonuser) {

                var ppfull = rawjsonuser[0].pp_raw;
                var username = rawjsonuser[0].username;
                var uid = rawjsonuser[0].user_id;
                var country = rawjsonuser[0].country;
                var oldrank = rawjsonuser[0].pp_rank;

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
                    if (derank) scores.splice(derankpos - 1, 1);
                    else scores.pop();

                    // add the hypothetical play to the list and sort it
                    scores.push(ppraw);
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

                            let embed = {
                                color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                                author: {
                                    name: username,
                                    icon_url: flagurl,
                                    url: `https://osu.ppy.sh/u/${uid}`
                                },
                                description: `**${(Math.round(ppfull * 100) / 100).toLocaleString()}pp** *currently*
                                **${(Math.round(newpp * 100) / 100).toLocaleString()}pp** *after ${(Math.round(ppraw * 100) / 100).toLocaleString()}pp play*
                                **${diffsymbol}${differencerounded}pp** *difference*
                                **#${Math.round(oldrank).toLocaleString()} → #${Math.round(newrank).toLocaleString()}** *rank change*`
                            }

                            return message.channel.send({ embed: embed });
                        };
                    };

                    xhttp.open("GET", "https://osudaily.net/data/getPPRank.php?t=pp&v=" + Math.round(newpp) + "&m=" + mode, true);
                    xhttp.send();

                    var dead;
                    var done = false;

                    dead = setTimeout(function () {
                        let embed = {
                            color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                            author: {
                                name: username,
                                icon_url: flagurl,
                                url: `https://osu.ppy.sh/u/${uid}`
                            },
                            description: `**${(Math.round(ppfull * 100) / 100).toLocaleString()}pp** *currently*
                            **${(Math.round(newpp * 100) / 100).toLocaleString()}pp** *after ${(Math.round(ppraw * 100) / 100).toLocaleString()}pp play*
                            **${diffsymbol}${differencerounded}pp** *difference*`
                        }

                        done = true;
                        return message.channel.send({ embed: embed });

                    }, 5000);
                }

            }).catch(error => {
                return console.log(error);
            });

        }).catch(error => {
            return console.log(error);
        });
    }
    catch (error) {
        return console.log(error);
    }
};

module.exports.help = {
    name: "netpp",
    description: "Calculate how much a new play would affect your total pp and rank.\n\nParameters:\n\`-m <taiko/ctb/mania>\` change the gamemode\n\`-o <position>\` overwrite a play (1-100) on your top plays.",
    usage: "netpp [<user>] <raw pp> [<parameters>]",
    example: "netpp shdewz 500",
    category: "osu!"
}