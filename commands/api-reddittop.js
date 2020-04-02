const fetch = require("node-fetch");
const moment = require("moment");

module.exports.run = async (message, args) => {

    if (args.length == 0) return;
    let subreddit = args[0];
    let timeframe = "day";
    if (args[1]) timeframe = args[1].toLowerCase();

    let post = await fetch(`https://www.reddit.com/r/${subreddit}/top.json?t=${timeframe}&limit=1`).then(async response => {
        return await response.json();
    }).then(async data => {
        return await data.data.children[0].data;
    })

    if (post.over_18 && !message.channel.nsfw) {
        return message.reply("nsfw post, we ain't doin that here sir");
    }

    let image = "";
    let description = "";
    if (post.url.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpe?g|gif|png)/) || post.url.includes("osu.ppy.sh/ss/")) image = { url: post.url };
    if (post.selftext != "") description = post.selftext;

    if (description.length > 802) {
        description = description.substring(0, 800) + `...\n\n[Continue reading](https://reddit.com${post.permalink})`;
    }

    let datetime = moment.unix(post.created);
    let flair = "—"
    if (post.link_flair_text) flair = post.link_flair_text;

    let embed = {
        color: message.member.displayColor,
        author: {
            name: post.title,
            url: "https://reddit.com" + post.permalink
        },
        description: description,
        fields: [
            {
                name: "Upvotes", value: post.score.toLocaleString(), inline: true
            },
            {
                name: "Comments", value: post.num_comments.toLocaleString(), inline: true
            },
            {
                name: "Flair", value: flair, inline: true
            },
        ],
        image: image,
        footer: {
            text: `Posted by ${post.author} on ${datetime.format("Do MMMM, YYYY [at] HH:mm")}`
        }
    }

    return message.channel.send({ embed: embed });
};

module.exports.help = {
    name: "reddit",
    description: "Top post of a subreddit for a certain time frame.",
    usage: "reddit <subreddit> [<hour/day/month/year/all>]",
    category: "Api"
}