const config = require("../config.json");
const fs = require("fs");
const Fuse = require("fuse.js");
const moment = require("moment");
const responses = require("../the_brains.json").responses;

const fuse = new Fuse(responses, { includeScore: true, location: 0, distance: 6, threshold: 0.4, minMatchCharLength: 5, keys: ["message"] });

module.exports.run = async (message, args) => {
    this.respond(args.join(" ").replace("\\", "").replace("\"", "'").toLowerCase(), message.channel);
};

module.exports.respond = async (query, channel) => {
    query = query.replace("\\", "").replace("\"", "'");
    if (query.length > 100 || query.length < 1) return;
    var results = fuse.search(query.toLowerCase());

    if (results.length == 0) return;

    if (results[0].score > 0.2) return;

    console.log(`[${moment().format("HH:mm:ss")}] '${query}' : '${results[0].item.message}' (${results[0].score.toFixed(4)})`);
    var item = results[0].item.response;
    var rng = Math.floor(Math.random() * item.length);

    return channel.send(item[rng]);
};

module.exports.collect = async (message) => {
    if (message.content == "") return;
    var keyword = message.content.toLowerCase();
    keyword.replace("\\", "").replace("\"", "'");
    if (keyword.length > 100) return;

    const filter = response => { return response.author != message.author && !response.author.bot; };

    message.channel.awaitMessages(filter, { max: 1 })
        .then(collected => {
            if (!collected.first() || collected.first().content == "" || collected.first().content.length > 100) return;
            collresponse = collected.first().content.replace("\\", "").replace("\"", "'");
            if (["!", "%", "<", ">", "$", "/"].includes(collresponse.substring(0, 1))) return;
            var responseobj = JSON.parse(JSON.stringify(fs.readFileSync("the_brains.json", "utf-8")));

            // check if keyword already exists
            for (var i = 0; i < responseobj.responses.length; i++) {
                if (responseobj.responses[i].message.toLowerCase() == keyword) {
                    if (responseobj.responses.includes(keyword)) return; // ignore duplicates

                    responseobj.responses[i].response.push(collresponse.toLowerCase());

                    fs.writeFile("the_brains.json", JSON.stringify(responseobj), err => {
                        if (err) return console.log("error", err);
                    });

                    return;
                }
            }

            var obj = {
                "message": keyword,
                "response": [collresponse.toLowerCase()]
            }

            responseobj.responses.push(obj);

            fs.writeFile("the_brains.json", JSON.stringify(responseobj), err => {
                if (err) return console.log("error", err);
            });

            return;
        })
};

module.exports.help = {
    name: "response",
    category: "sys"
}
