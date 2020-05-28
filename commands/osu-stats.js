const config = require("../config.json");
const osu = require("../osu.js");

module.exports.run = async (message, args) => {
    try {
        let username;
        let found;

        if (args.length > 0) username = args.join("_");
        else {
            for (var i = 0; i < statObj.users.length; i++) {
                if (statObj.users[i].discord == message.author.id) {
                    username = statObj.users[i].osu_id;
                    found = true;
                    break;
                }
            }
            if (!found) return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${config.prefix}osuset <user>\`.`)
        }

        let s = await osu.getUser(username);
        if (s.error) return message.channel.send(s.error);

        let embed = {
            color: message.member.displayColor,
            author: {
                name: `osu! stats for ${s.username}`,
                icon_url: `https://osu.ppy.sh/images/flags/${s.country}.png`,
                url: s.url
            },
            thumbnail: {
                url: `${s.avatar}?${+new Date()}`,
            },
            description: `**Rank** — *#${s.rank.toLocaleString()} (#${s.countryrank.toLocaleString()} ${s.country})*
            **PP** — *${s.pp.toFixed(2).toLocaleString()}pp*
            **Accuracy** — *${s.acc.toFixed(2)}%*
            **Playcount** — *${s.playcount.toLocaleString()}*
            **Ranked Score** — *${abbreviateNumber(s.score)}*
            **Playtime** — *${s.playtime.toFixed()} hours*
            **Level** — *${Math.floor(s.level)} (${s.progress.toFixed(2)}%)*`
        }

        return message.channel.send({ embed: embed });
    }
    catch (error) {
        return console.log(error);
    }
};

module.exports.help = {
    name: "osu",
    aliases: ["stats"],
    description: "Show osu! stats of someone",
    usage: "osu [<user>]",
    example: "osu shdewz",
    category: "osu!"
}

function abbreviateNumber(value) {
    if (value < 1000000) return value.toLocaleString();
    let newValue = value;
    const suffixes = ["", "", " million", " billion", " trillion"];
    let suffixNum = 0;
    while (newValue >= 1000) {
        newValue /= 1000;
        suffixNum++;
    }

    newValue = newValue.toPrecision(3);

    newValue += suffixes[suffixNum];
    return newValue;
}