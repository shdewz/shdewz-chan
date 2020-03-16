const axios = require("axios");
const moment = require("moment");

const api = axios.create({
    baseURL: "https://en.wikipedia.org",
});

module.exports.run = async (message, args, client) => {
    try {
        if (args.length < 1) return message.reply("missing arguments.");

        var query;
        query = args.join("_");
        api.get("/w/api.php", {
            params: { action: "opensearch", limit: "5", namespace: "0", format: "json", search: query }
        }).then(response => {
            var data = response.data;
            var results = data[1];
            var links = data[3];
            if (results.length == 0) return message.reply("no articles found.");

            let emotes = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

            var resultText = "";
            for (var i = 0; i < results.length; i++) {
                resultText += `${emotes[i]} - [${results[i]}](${links[i]})\n`
            }

            if (results.length == 1) {
                return getPage(0, results, message);
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
                        getPage(position, results, message);
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

function getPage(position, results, message) {
    api.get(`/api/rest_v1/page/summary/${results[position].replace(" ", "_").replace("/", "")}`).then(response => {
        var data = response.data;

        var time = moment(data.timestamp).format("MMMM Do, YYYY [at] HH:mm")

        api.get(data.api_urls.media).then(response => {
            var mediaData = response.data;

            // find appliccable thumbnail image 
            var thumbnail = "";
            if (data.originalimage) thumbnail = { url: data.originalimage.source }
            else {
                if (mediaData.items.length > 0 && mediaData.items[0].type == "image") {
                    thumbnail = { url: mediaData.items[0].original.source }
                }
            }

            var textString = data.extract;
            if (textString.length > 802) {
                var textString = textString.substring(0, 800) + "...";
            }

            var desc;
            if (data.description) desc = data.description;
            else desc = "---"

            let embed = {
                color: 0xe84393,
                author: {
                    name: data.titles.normalized,
                    url: data.content_urls.desktop.page
                },
                thumbnail: thumbnail,
                fields: [
                    {
                        name: desc,
                        value: `${textString}\n\n[Continue reading](${data.content_urls.desktop.page})`
                    }
                ],
                footer: {
                    text: `Last updated ${time}`
                }
            }

            return message.channel.send({ embed: embed });
        });
    });
}

module.exports.help = {
    name: "wikipedia",
    aliases: ["wiki"],
    description: "Search wikipedia for an article.",
    category: "Api",
    usage: "wikipedia <search term>",
    example: "wikipedia cock and ball torture"
}