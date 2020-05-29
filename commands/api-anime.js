const fetch = require("node-fetch");
const config = require("../config.json");
const moment = require("moment");
const fs = require("fs");

const ratings = {
    s: "safe",
    q: "questionable",
    e: "explicit",
};

module.exports.run = async (message, args) => {
    if (args.includes("/last")) {
        for (var i = 0; i < statObj.serverstats.length; i++) {
            if (statObj.serverstats[i].id == message.channel.guild.id) {
                for (var j = 0; j < statObj.serverstats[i].channels.length; j++) {
                    if (
                        statObj.serverstats[i].channels[j].id == message.channel.id
                    ) {
                        let last =
                            statObj.serverstats[i].channels[j].content.lastAnime;

                        let sourceText;
                        if (last.source)
                            sourceText = `**[Source](${last.source})**`;
                        else sourceText = "*No source provided*";

                        let embed = {
                            color: message.member.displayColor,
                            author: {
                                name: `Latest anime post in #${message.channel.name}`,
                            },
                            thumbnail: {
                                url: last.file_url,
                            },
                            description: `**Rolled by:** ${last.rolled_by}
                            ${sourceText}
                            **Score:** ${last.score}
                            **Rating:** ${ratings[last.rating]}
                            **Tags:** \`${last.tags.split(" ").join("` `")}\``,
                        };

                        return message.channel.send({ embed: embed });
                    }
                }
                return message.channel.send(
                    "No anime posts found in this channel.",
                );
            }
        }
        return message.channel.send("No anime posts found in this channel.");
    }

    args = args.map(x => {
        return x.toLowerCase();
    });
    if (args.includes("/nsfw")) {
        if (message.channel.nsfw) {
            args.splice(args.indexOf("/nsfw"));
            args.push("-rating:safe");
        } else return message.channel.send("NOT HERE " + message.author);
    } else args.push("rating:safe");

    if (args.includes("/familyfriendly")) {
        args.splice(args.indexOf("/familyfriendly"), 1);
        args = `${args.join(" ")} -ass -bikini -cleavage`.split(" ");
    }

    var searchfilters = [
        "furry",
        "decapitation",
        "tentacles",
        "gay",
        "goat",
        "gore",
        "zombie",
        "dead",
        "bull",
        "insects",
        "maggots",
        "cockroach",
        "impregnation",
        "toddler",
        "rape",
        "gangbang",
        "prolapse",
        "inflation",
        "horse",
        "pegging",
        "futanari",
        "baby",
        "futa",
        "futanari",
        "all_the_way_through",
        "death",
        "corpse",
        "scat",
        "yaoi",
        "orc",
        "torture",
        "grandma",
        "old_woman",
        "goblin",
        "ronald_mcdonald",
        "anal_hook",
        "trap"
    ];

    if (searchfilters.some(filter => args.includes(filter)))
        return message.channel.send("<:WideWeirdChamp3:712801137266524231>");

    // Perform a search for popular image posts
    const baseurl =
        "https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1";
    const auth = config.gelbooru_auth;
    const tags = "&tags=" + args.join("+") + "+score:>4";

    const apiCall = async () => {
        try {
            const response = await fetch(baseurl + auth + tags);
            const result = await response.json();

            var maxtries = 10;
            var found = false;
            var tries = 0;

            while (!found) {
                if (tries >= maxtries)
                    return message.channel.send("No images found.");

                var rng = Math.floor(Math.random() * result.length);
                if (
                    !searchfilters.some(filter =>
                        result[rng].tags.includes(filter),
                    )
                )
                    break;

                tries++;
            }

            var url = result[rng].file_url;
            result[rng].rolled_by = message.member.displayName;
            message.channel.send(url);

            var exists = false;
            for (var i = 0; i < statObj.serverstats.length; i++) {
                if (statObj.serverstats[i].id == message.channel.guild.id) {
                    for (
                        var j = 0;
                        j < statObj.serverstats[i].channels.length;
                        j++
                    ) {
                        if (
                            statObj.serverstats[i].channels[j].id ==
                            message.channel.id
                        ) {
                            exists = true;
                            statObj.serverstats[i].channels[j].content.lastAnime =
                                result[rng];
                        }
                    }
                    if (!exists) {
                        var obj = {
                            id: message.channel.id,
                            content: {
                                lastAnime: result[rng],
                            },
                        };
                        statObj.serverstats[i].channels.push(obj);
                        exists = true;
                    }
                }
            }
            if (!exists) {
                var obj = {
                    id: message.channel.guild.id,
                    channels: [
                        {
                            id: message.channel.id,
                            content: {
                                lastAnime: result[rng],
                            },
                        },
                    ],
                };
                statObj.serverstats.push(obj);
            }

            // it's pinging time
            if (message.guild.id == "667863566279507994") {
                // LwL
                if (result[rng].tags.includes("loli"))
                    message.channel.send("hey <@110538906637721600> got some loli content for you here");
                // bart
                if (result[rng].tags.includes("feet"))
                    message.channel.send("hey <@184753701519360001> have feet");
                // shdewz
                if (result[rng].tags.includes("ke-ta"))
                    message.channel.send("ke-ta ow o you fucking nonce <@250693235091963904>");
                // lokser
                if (result[rng].tags.includes("love_live!"))
                    message.channel.send("idols spotted <@250998032856776704> <@117555792894361602>");
                // menty
                if (result[rng].tags.includes("konpaku_youmu") && result[rng].rating == "s")
                    message.channel.send("<@117555792894361602> caring wife");
                if (result[rng].tags.includes("armpits") && !result[rng].tags.includes("hairy_armpits"))
                    message.channel.send("pits of the arms <@117555792894361602>");
            }
            return;
        } catch (err) {
            if (err.type == "invalid-json") return message.channel.send("No images found.");
            else return console.error(err);
        }
    };
    return apiCall();
};

module.exports.help = {
    name: "anime",
    description:
        "Searches gelbooru based on the given tags. Defaults to non-nsfw content. Use `/nsfw` at the end to show them or `/familyfriendly` for even more strict results.",
    usage: "anime <tags> [/nsfw, /familyfriendly]",
    example: "anime ke-ta touhou /nsfw",
    category: "Api",
};
