const fuzzysort = require("fuzzysort");
const moment = require("moment");
const config = require("../config.json");
const fs = require("fs");

let defaultqueries = ["hi", "hello", "hey"];

let servers = [];

module.exports.run = async (message, args) => {
    this.respond(args.join(" ").replace("\\", "").replace("\"", "'").toLowerCase(), message.channel);
};

module.exports.init = async () => {
    config.responses.collect.forEach(server_id => {
        let filename = `settings/responses/${server_id}.json`;
        let resp = [];
        if (fs.existsSync(filename)) resp = JSON.parse(fs.readFileSync(filename, "utf-8")).responses;

        let obj = { id: server_id, responses: resp }
        servers.push(obj);
    });

    setInterval(() => { this.save(); }, 1 * 60 * 1000);
};

module.exports.save = () => {
    servers.forEach(server => {
        if (server.responses.length > 0) {
            fs.writeFileSync(`settings/responses/${server.id}.json`, JSON.stringify(server), err => { if (err) console.log(err); });
        }
    });
}

module.exports.respond = async (content, message) => {
    let query_arr = content.split(" ").filter(a => !a.match(/<@!?(\d+)>/));
    if (query_arr.length == 0) var query = defaultqueries[Math.floor(Math.random() * defaultqueries.length)];
    else var query = query_arr.join(" ");

    let s = servers.find(sr => sr.id == message.guild.id);
    if (!s) return;

    let results = fuzzysort.go(query, s.responses, { key: "message", allowTypo: true, limit: 5, threshold: -70000 }).filter(r => r.obj.message.length < Math.pow(query.length, 3) + 3);
    if (results.length == 0) {
        // try without punctuation
        let altquery = query.replace(/[?!,.':-]/, "");
        results = fuzzysort.go(altquery, s.responses, { key: "message", allowTypo: true, limit: 5, threshold: -70000 }).filter(r => r.obj.message.length < Math.pow(altquery.length, 3) + 3);
        if (results.length == 0) return; // if still nothing then death
    }

    let result = results[Math.floor(Math.random() * results.length)];
    if (Math.abs(result.obj.message.length - query.length) > Math.pow(query.length, 3) + 3) return;
    let text = result.obj.response[Math.floor(Math.random() * result.obj.response.length)];

    if (text.includes("@everyone") || text.includes("@here")) return;

    console.log(`[${moment().format("HH:mm:ss")}] '${query}' -> '${result.obj.message}' (${result.score})`);
    return message.channel.send(text);
};

module.exports.collect = async (message, client) => {
    if (message.content == "" || message.channel.nsfw) return;
    var keyword = message.content;
    keyword.replace("\\", "").replace("\"", "'");
    if (keyword.length > 100) return;

    const filter = response => { return !response.author.bot; };

    message.channel.awaitMessages(filter, { max: 1 }).then(collected => {
        if (collected.first().author === message.author) return;
        let content = collected.first().content.replace("\\", "").replace("\"", "'");
        if (content === "" || content.length > 100 || ["%", ">"].includes(content.substring(0, 1)) || collected.first().mentions.has(client.user)) return;

        if (keyword.includes("@everyone") || keyword.includes("@here")) return;

        let s = servers.findIndex(s => s.id == message.guild.id);
        if (s == -1) return;

        let f = servers[s].responses.findIndex(r => r.message.toLowerCase() == keyword.toLowerCase());
        if (f == -1) return servers[s].responses.push({ message: keyword, response: [content] });

        let exists = servers[s].responses[f].response.findIndex(r => r == content);
        if (exists == -1) servers[s].responses[f].response.push(content);

        return;
    })
};

module.exports.help = {
    name: "response",
    category: "sys"
}
