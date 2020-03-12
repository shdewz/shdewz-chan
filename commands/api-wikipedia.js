const axios = require("axios");
const moment = require("moment");

module.exports.run = async (message, args, client) => {
    try {
        if (args.length < 1) return message.reply("missing arguments.");

        const api = axios.create({
            baseURL: "https://en.wikipedia.org",
        });

        var query;
        query = args.join("_");
        api.get("/w/api.php", {
            params: { action: "opensearch", limit: "9", namespace: "0", format: "json", search: query }
        }).then(response => {
            var data = response.data;
            var results = data[1];
            if (results.length == 0) return message.reply("no articles found.");

            let emotes = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

            var resultText = "";
            for (var i = 0; i < results.length; i++) {
                resultText += `${emotes[i]} - ${results[i]}\n`
            }

            let embed = {
                color: 0xe84393,
                author: {
                    name: `Wikipedia results for '${args.join(" ")}':`,
                },
                description: `${resultText}`,
                footer: {
                    text: `Choose an article by reacting to this message.`
                }
            }

            message.channel.send({ embed: embed }).then(async sentMsg => {
                for (var i = 0; i < results.length; i++) {
                    await sentMsg.react(emotes[i]);
                }

                const filter = (reaction, user) => {
                    return emotes.includes(reaction.emoji.name) && user.id === message.author.id;
                };

                const collector = sentMsg.createReactionCollector(filter, { max: 1, time: 20000 });

                collector.on('end', collected => {
                    if (collected.size > 0) {
                        var reaction = collected.first().emoji.name;
                        var position = emotes.indexOf(reaction);

                        api.get(`/api/rest_v1/page/summary/${results[position].split(" ").join("_")}`).then(response => {
                            var data = response.data;

                            var time = moment(data.timestamp).format("MMMM Do, YYYY [at] HH:mm")

                            var thumbnail = "";
                            if (data.originalimage) thumbnail = { url: data.originalimage.source }

                            let embed = {
                                color: 0xe84393,
                                author: {
                                    name: data.titles.normalized,
                                    url: data.content_urls.desktop.page
                                },
                                thumbnail: thumbnail,
                                fields: [
                                    {
                                        name: data.description,
                                        value: `${data.extract}\n\n[Continue reading](${data.content_urls.desktop.page})`
                                    }
                                ],
                                footer: {
                                    text: `Last updated ${time}`
                                }
                            }

                            return message.channel.send({ embed: embed });
                        });
                    }
                    else return message.channel.send("**too slow** 😩");
                });
                return;
            });
        });
    }
    catch (err) {
        return console.error(err);
    }

};

module.exports.help = {
    name: "wikipedia",
    aliases: ["wiki"],
    description: "Search wikipedia for an article.",
    category: "Api",
    usage: "wikipedia <search term>",
    example: "wikipedia cock and ball torture"
}