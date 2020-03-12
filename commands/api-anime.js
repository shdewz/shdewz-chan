const fetch = require('node-fetch');
const config = require("../config.json");

module.exports.run = async (message, args) => {
    args = args.map(x => { return x.toLowerCase() });
    if (args[args.length - 1] == "/nsfw") {
        if (message.channel.nsfw) { args.pop(); args.push("-rating:safe"); }
        else return message.channel.send("NOT HERE " + message.author);
    }
    else args.push("rating:safe");

    if (args[args.length - 1] == "/familyfriendly") { args.pop(); args = (`${args.join(" ")} -ass -bikini -cleavage`).split(" "); }

    var searchfilters = ["furry", "decapitation", "tentacles", "gay", "goat", "gore", "zombie", "dead", "bull", "insects", "maggots", "cockroach", "impregnation", "toddler", "obese", "rape", "gangbang", "prolapse", "inflation", "horse", "pegging"];

    if (searchfilters.some(filter => args.includes(filter))) return message.channel.send("<:WideWeirdChamp3:669996507726086174>");

    // Perform a search for popular image posts
    const baseurl = 'https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1';
    const auth = config.gelbooru_auth;
    const tags = '&tags=' + args.join("+");

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
    name: "anime",
    description: "Searches gelbooru based on the given tags. Defaults to non-nsfw content. Use \`/nsfw\` at the end to show them or \`/familyfriendly\` for even more strict results.",
    usage: "anime <tags> [/nsfw, /familyfriendly]",
    example: "anime ke-ta touhou /nsfw",
    category: "Api"
}