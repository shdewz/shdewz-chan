const fetch = require('node-fetch');
const config = require("../config.json");
const Discord = require('discord.js');

module.exports.run = async (message, args) => {
    var safe;
    if (args[args.length - 1] == "/nsfw") {
        if (message.channel.nsfw) {
            safe = false; args.pop();
        }
        else {
            return message.channel.send("NOT HERE " + message.author);
        }
    }
    else safe = true;

    if (args[args.length - 1] == "/familyfriendly") { args.pop(); args = (`${args.join(" ")} -ass -bikini -cleavage`).split(" "); }

    var filters = ["furry", "decapitation", "tentacles", "gay", "goat", "gore", "zombie", "dead", "bull", "insects", "maggots", "cockroach"];

    if (filters.some(filter => args.join(" ").toLowerCase().includes(filter))) {
        var mutedrole = message.guild.roles.find(role => role.name === "muted");
        try {
            if (mutedrole) message.member.addRole(mutedrole.id);
            return message.channel.send("<:WideWeirdChamp3:669996507726086174>");
        } catch (error) {
            return console.error(error);
        }

    }

    console.log(args)

    // Perform a search for popular image posts
    const baseurl = 'https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1';
    const auth = config.gelbooru_auth;
    const tags = '&tags=' + args.join("+");
    console.log(baseurl + auth + tags);

    const apiCall = async () => {
        try {
            const response = await fetch(baseurl + auth + tags);
            const result = await response.json();

            var rng = Math.floor(Math.random() * result.length);

            var limit = 0;
            var found = false;

            if (safe) {
                do {
                    var rng = Math.floor(Math.random() * result.length);
                    limit++;
                    if (result[rng].rating == "s") found = true;
                } while (!found && limit < 50);
            }
            else {
                do {
                    var rng = Math.floor(Math.random() * result.length);
                    limit++;
                    if (result[rng].rating == "q" || result[rng].rating == "e") found = true;
                } while (!found && limit < 50);
            }

            if (limit >= 50) return message.channel.send("No images found.");

            var url = result[rng].file_url;
            //const attachment = new Discord.MessageAttachment(url);

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
    usage: "anime <tags> [</nsfw, /familyfriendly>]",
    example: "anime ke-ta touhou /nsfw",
    category: "Api"
}