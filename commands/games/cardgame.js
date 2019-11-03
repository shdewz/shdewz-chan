const Discord = require('discord.js');

const { prefix, token } = require('../../config.json');
const index = require("../../index.js");
const client = new Discord.Client();

var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
var suits = ["C", "H", "S", "D"]

var gameactive = {}

var playeramount = {}
var players = {}
var cards = {}
var count = {}

function cardGame(message, args)
{
    var gid = message.guild.id;

    switch (args[1].toLowerCase())
    {
        case "start":
            try
            {
                if (args[2])
                {
                    if (args[2] > 5)
                    {
                        message.channel.send("too many players");
                    }
                    else
                    {
                        if (!gameactive[gid])
                        {
                            gameactive[gid] = true;
                            playeramount[gid] = args[2];
                            players[gid] = [];

                            const cardsEmbed = new Discord.RichEmbed()
                                .setColor('#ff007a')
                                .setTitle('**Cards**')
                                .setDescription(`Card game is about to begin!\nUse \`${prefix}cards join\` to participate.\nThe game will start when enough players have joined.`)
                                .addField('Settings', `- ${playeramount[gid]} players`)
                            message.channel.send(cardsEmbed);

                            return;
                        }
                        else
                        {
                            message.channel.send("Game already active");
                            return;
                        }
                    }
                }
                else
                {
                    message.channel.send("Specify the amount of players");
                    return;
                }
            }
            catch (error)
            {
                console.log(error);
            }


            break;

        case "join":
            if (gameactive[gid])
            {
                if (players[gid].length < playeramount[gid])
                {
                    players[gid].push(message.author.username);

                    if (players[gid].length == playeramount[gid])
                    {
                        // ---------------------
                        // start
                        // ---------------------


                        count[gid] = 0;
                        cards[gid] = [];

                        for (i = 0; i < players[gid].length; i++)
                        {
                            (players[gid])[i] = [];
                            for (a = 1; a <= 5; a++)
                            {
                                for (s in suits)
                                {
                                    var suit = suits[s];
                                    for (n in numbers)
                                    {
                                        var num = numbers[n]
                                        var card = {
                                            suit: suit,
                                            number: num,
                                            order: Math.floor(Math.random() * 5200) + 1
                                        };
                                        cards[gid].push(card);
                                        (players[gid])[i].push(card);
                                    }
                                }
                                cards[gid] = cards[gid].sort(function (a, b)
                                {
                                    return (a.order < b.order ? -1 : 1)
                                });
                                for (var i = 0; i < 5; i++)
                                {
                                    count[gid]++;
                                }
                            }
                        }
                        console.log(players[gid])
                        console.log("---------")
                        for (i = 0; i < players[gid].length; i++)
                        {
                            console.log((players[gid])[i])
                        }


                        // ---------------------
                        // end
                        // ---------------------
                    }
                }
                else
                {
                    message.channel.send("Game is already going");
                    return;
                }
            }
            else
            {
                message.channel.send(`no game currently active\nstart one using \`${prefix}cards start <players>\``);
                return;
            }
            break;

        case "abort":

            break;
    }
}

function playCardGame()
{

}

module.exports.cards = cardGame;

client.login(token);