const fetch = require("node-fetch");
const moment = require("moment");
const config = require("../config.json");

module.exports.run = async (message, args) => {

    const baseURL = "https://api.twitch.tv/helix/";

    var searchUser = false;
    if (args.join(" ").toLowerCase().includes("-u")) {
        searchUser = true;
        args.splice(args.indexOf("-u"), 1);
    }

    var dateparam = 0;
    if (args.join(" ").toLowerCase().includes("-d")) {
        var datestring = args[args.indexOf("-d") + 1].toLowerCase();
        args.splice(args.indexOf("-d"), 2);
        if (datestring == "week") dateparam = 1;
        else if (datestring == "month") dateparam = 2;
        else if (datestring == "all") dateparam = 3;
    }

    var query = args.join(" ");

    if (dateparam == 0) var start = new Date(moment().subtract(1, 'days').format()).toISOString();
    else if (dateparam == 1) var start = new Date(moment().subtract(7, 'days').format()).toISOString();
    else if (dateparam == 2) var start = new Date(moment().subtract(30, 'days').format()).toISOString();
    else if (dateparam == 3) var start = new Date(moment().subtract(9999, 'days').format()).toISOString();
    var today = new Date().toISOString();

    if (searchUser) {
        var options = {
            method: "GET",
            headers: { "Client-ID": config.twitchAuth }
        };

        try {
            let user = await fetch(`${baseURL}users?login=${query}`, options).then(async response => {
                return await response.json();
            });
            if (!user || !user.data[0]) return message.channel.send("User '" + query + "' not found.");
            let userID = user.data[0].id;

            let data = await fetch(`${baseURL}clips?broadcaster_id=${userID}&first=20&ended_at=${today}&started_at=${start}`, options).then(async response => {
                return await response.json();
            }).then(async data => {
                return await data;
            })

            let clip = data.data[Math.floor(Math.random() * data.data.length)];

            console.log(clip);

            let embed = {
                color: message.member.displayColor,
                author: {
                    name: clip.title,
                    url: clip.url
                },
                fields: [
                    {
                        name: "Channel", value: clip.broadcaster_name, inline: true
                    },
                    {
                        name: "Views", value: clip.view_count, inline: true
                    },
                    {
                        name: "Clipped by", value: clip.creator_name, inline: true
                    },
                ],
                footer: {
                    text: `Clipped on ${moment.utc(clip.created_at).format("Do MMMM, YYYY [at] HH:mm")}`
                }
            }

            message.channel.send({ embed: embed });
            return message.channel.send(clip.url);
        }
        catch (err) {
            message.channel.send("error")
            return console.log(err);
        }
    }
    else {
        var options = {
            method: "GET",
            headers: { "Client-ID": config.twitchAuth }
        };

        try {
            let game = await fetch(`${baseURL}games?name=${query}`, options).then(async response => {
                return await response.json();
            });
            if (!game.data[0]) return message.channel.send("Game '" + query + "' not found.");
            let gameID = game.data[0].id;

            let data = await fetch(`${baseURL}clips?game_id=${gameID}&first=20&ended_at=${today}&started_at=${start}`, options).then(async response => {
                return await response.json();
            }).then(async data => {
                return await data;
            })

            let clip = data.data[Math.floor(Math.random() * data.data.length)];

            console.log(clip);

            let embed = {
                color: message.member.displayColor,
                author: {
                    name: clip.title,
                    url: clip.url
                },
                fields: [
                    {
                        name: "Channel", value: clip.broadcaster_name, inline: true
                    },
                    {
                        name: "Views", value: clip.view_count, inline: true
                    },
                    {
                        name: "Clipped by", value: clip.creator_name, inline: true
                    },
                ],
                footer: {
                    text: `Clipped on ${moment.utc(clip.created_at).format("Do MMMM, YYYY [at] HH:mm")}`
                }
            }

            message.channel.send({ embed: embed });
            return message.channel.send(clip.url);
        }
        catch (err) {
            message.channel.send("error")
            return console.log(err);
        }
    }
}

module.exports.help = {
    name: "twitch",
    description: "clips n shit",
    usage: "twitch [<-u>] <game/user> [<-d day/week/month/all>]",
    example: "twitch osu!",
    example2: "twitch -u flc_osu -d week",
    category: "Api"
}