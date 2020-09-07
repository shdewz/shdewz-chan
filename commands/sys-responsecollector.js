const fuzzysort = require("fuzzysort");
const moment = require("moment");

module.exports.run = async (message, args) => {
    this.respond(args.join(" ").replace("\\", "").replace("\"", "'").toLowerCase(), message.channel);
};

module.exports.respond = async (content, channel) => {
    let query_arr = content.split(" ").filter(a => !a.match(/<@!?(\d+)>/));
    if (query_arr.length == 0) var query = "hi";
    else var query = query_arr.join(" ");

    const results = fuzzysort.go(query, responseObj.responses, { key: "message", allowTypo: true, limit: 3, threshold: -70000 });
    if (results.length == 0) return;
    if (Math.abs(results[0].obj.message.length - query.length) > 3 * query.length) return;
    let result = results[Math.floor(Math.random() * results.length)];
    let message = result.obj.response[Math.floor(Math.random() * result.obj.response.length)];

    if (message.includes("@everyone") || message.includes("@here")) return;

    console.log(`[${moment().format("HH:mm:ss")}] '${query}' -> '${result.obj.message}' (${result.score})`);
    return channel.send(message);
};

module.exports.collect = async (message) => {
    if (message.content == "") return;
    var keyword = message.content;
    keyword.replace("\\", "").replace("\"", "'");
    if (keyword.length > 100) return;

    const filter = response => { return !response.author.bot; };

    message.channel.awaitMessages(filter, { max: 1 })
        .then(collected => {
            if (collected.first().author === message.author) return;
            if (!collected.first() || collected.first().content === "" || collected.first().content.length > 120) return;
            collresponse = collected.first().content.replace("\\", "").replace("\"", "'");

            if (keyword.includes("@everyone") || keyword.includes("@here")) return;

            // check if keyword already exists
            for (var i = 0; i < responseObj.responses.length; i++) {
                if (responseObj.responses[i].message.toLowerCase() == keyword.toLowerCase()) {
                    if (responseObj.responses.includes(keyword)) return; // ignore duplicates
                    responseObj.responses[i].response.push(collresponse);
                    return;
                }
            }

            var obj = {
                "message": keyword,
                "response": [collresponse]
            }

            responseObj.responses.push(obj);
            return;
        })
};

module.exports.help = {
    name: "response",
    category: "sys"
}
