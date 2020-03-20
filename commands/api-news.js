const axios = require("axios");
const config = require("../config.json");

module.exports.run = async (message, args) => {
    if (args.length == 0) return;

    const apikey = config.newsapi;
    const api = axios.create({
        baseURL: "https://newsapi.org/v2",
    });

    if (args[0].toLowerCase() == "top") {
        var country;
        if (args.length > 1 && args[1].match(/([a-zA-Z]){2}/)) country = args[1].toLowerCase();
        else country = "us";

        var position;
        if (args.length > 2 && !isNaN(args[2])) position = args[2];
        else if (args.length > 1 && !isNaN(args[1])) position = args[1];
        else position = "random";

        var endpoint = "/top-headlines";
        var params = { country: country, apiKey: apikey };
    }
    else if (args[0].toLowerCase() == "search") {
        var search = message.content.match(/"([^"]+)"/)[1];

        var position;
        if (args.length > 2 && !isNaN(args[2])) position = args[2];
        else position = "random";

        var endpoint = "/everything";
        var params = { q: search, sortBy: "popularity", apiKey: apikey };
    }
    else return;

    api.get(endpoint, { params: params }).then(response => {
        response = response.data;
        if (response == null) return;
        if (response.articles.length == 0) return message.channel.send("No articles found.");

        if (position == "random") position = Math.floor(Math.random() * response.articles.length);

        var article = response.articles[position];
        var date = new Date(article.publishedAt);

        let embed = {
            color: message.member.displayColor,
            author: {
                name: article.title,
                url: article.url
            },
            thumbnail: {
                url: article.urlToImage,
            },
            description: `${article.description}\n\n${article.content}`,
            footer: {
                text: `${date.toUTCString()} | ${article.source.name}`
            }
        }
        return message.channel.send({ embed: embed });
    });
};

module.exports.help = {
    name: "news",
    description: "Searches the news. You can either get the top headlines in a specific country with its 2 character country code or search the news with a specific search query.",
    category: "Api",
    usage: "news <top, search> <country, \"search query\">",
    example: "news search \"osu! gamer\""
}