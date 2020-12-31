const moment = require("moment");

let max_streak = 5;
let base_amount = 5;

module.exports.run = async (message) => {
    let id = message.author.id;
    let user = gacha.users.findIndex(u => u.id == id);

    if (user == -1) {
        gacha.users.push({ id: id, balance: 0, daily: { last_timestamp: 0, streak: 1, counter: 0 }, inventory: [] });
        user = gacha.users.findIndex(u => u.id == id);
    }

    let last_day = Math.floor(gacha.users[user].daily.last_timestamp / 1000 / 60 / 60 / 24);
    let today = Math.floor(moment.utc().valueOf() / 1000 / 60 / 60 / 24);

    if (today > last_day) { // check if daily can be taken
        if (today == last_day + 1) { // increase streak if valid
            gacha.users[user].daily.streak = Math.min(max_streak, gacha.users[user].daily.streak + 1);
        }
        else gacha.users[user].daily.streak = 1;

        console.log({ today, last_day });

        let daily_amount = base_amount + Math.pow((gacha.users[user].daily.streak - 1) / 2, 2);

        gacha.users[user].balance += daily_amount;
        gacha.users[user].daily.last_timestamp = moment.utc().valueOf();
        gacha.users[user].daily.counter += 1;

        //let streaktext = `⚪ `.repeat(gacha.users[user].daily.streak) + `⚫ `.repeat(max_streak - gacha.users[user].daily.streak);
        let streaktext = `**${gacha.users[user].daily.streak}** / ${max_streak}`;

        let embed = {
            color: message.member.displayColor,
            author: {
                name: message.author.username,
                icon_url: message.author.avatarURL()
            },
            fields: [
                {
                    name: "Daily reward",
                    value: "Streak\nAmount\nBalance",
                    inline: true,
                },
                {
                    name: "\u200b",
                    value: `${streaktext}\n**+${daily_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}** lolicoins\n**${gacha.users[user].balance.toLocaleString(undefined, {minimumFractionDigits: 2})}** lolicoins`,
                    inline: true,
                }
            ]
        }
        return message.channel.send({ embed: embed });
    }
    else return message.reply("you have already claimed your daily reward today.");
};

module.exports.help = {
    name: "daily",
    description: "Collect your daily reward.",
    category: "Gacha"
}