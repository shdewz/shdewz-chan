const fetch = require("node-fetch");

module.exports.run = async (message, args) => {

    let posts = await fetch("https://www.reddit.com/r/peppyRoastedHimGood/top.json?t=all&limit=100").then(async response => {
        return await response.json();
    }).then(async data => {
        return await data.data.children;
    })

    let rng = Math.floor(Math.random() * posts.length);
    let post = posts[rng].data;

    let embed = {
        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
        author: {
            name: post.title,
            url: "https://reddit.com" + post.permalink
        },
        image: {
            url: post.url
        }
    }

    return message.channel.send({ embed: embed });
};

module.exports.help = {
    name: "peppy",
    description: "he really did roast him good.",
    category: "Fun"
}