const fetch = require('node-fetch');
const config = require("../config.json");

module.exports.run = async (message, args) => {
    if (args[args.length - 1] == "-nsfw") { safe = false; args.pop(); }
    else safe = true;

    // Perform a search for popular image posts
    const baseurl = 'https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=200';
    const auth = config.gelbooru_auth;
    const tags = '&tags=shangguan_feiying rating:safe fujiwara_no_mokou meme';

    const apiCall = async () => {
        try {
            const response = await fetch(baseurl + auth + tags);
            const result = await response.json();

            var rng = Math.floor(Math.random() * result.length);
            var url = result[rng].file_url;

            return message.channel.send(url);
        }
        catch (err) {
            if (err.type == "invalid-json") message.channel.send("No images found.");
            return console.error(err);
        }
    }
    return apiCall();
};

module.exports.help = {
    name: "mokou",
    description: "Fetches a cool mokou meme",
    category: "Api"
}