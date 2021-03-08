const fetch = require("node-fetch");

let mintime = 10 * 60 * 1000; // 10 minutes
let maxtime = 120 * 60 * 1000; // 120 minutes

module.exports.init = async (client) => {
    function loop() {
        // random time between 10 and 120 minutes
        let time = Math.floor(Math.random() * (maxtime - mintime) + mintime);

        setTimeout(async () => {
            let joke = await getJoke();
            statObj.jokes.forEach(j => {
                client.users.cache.get(j.id).send(joke);
            });
            loop();
        }, time);
    }
    loop();
}

module.exports.run = async (message, args) => {
    if (args.includes("-subscribe")) {
        if (statObj.jokes.find(j => j.id == message.author.id)) return message.reply("you are already subscribed.");
        statObj.jokes.push({
            username: message.author.username,
            id: message.author.id,
        });
        return message.reply(`you have successfully been subscribed to receive funny stuff.`);
    }

    if (args.includes("-unsubscribe")) {
        let i = statObj.jokes.findIndex(j => j.id == message.author.id);
        if (i === -1) return message.reply("you are not currently subscribed.");
        else {
            statObj.jokes.splice(i, 1);
            return message.reply("you have been successfully unsubscribed.");
        }
    }

    let joke = await getJoke();
    return message.channel.send(joke);
}

async function getJoke() {
    return new Promise(async resolve => {
        fetch("https://icanhazdadjoke.com/slack").then(async response => {
            let data = await response.json();
            let joke = data.attachments[0].text;
            resolve(joke);
        });
    });
}

module.exports.help = {
    name: "joke",
    aliases: ["jokes", "funny"],
    description: "get a very unfunny joke.",
    category: "Api",
}