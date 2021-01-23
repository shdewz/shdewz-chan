const moment = require("moment");
const osu = require("../osu.js");
const tools = require("../tools.js");

let max_tries = 20;
let try_count = 0;

let last_map = 0;
let last_message = 0;
let delete_msg = false;

let timer;

module.exports.run = async (message, args, client) => {
    if (args.length == 0) return;
    args = args.map(a => a.toLowerCase());
    let match_id = args[0].match(/\d+/)[0];
    if (args.includes("-d")) delete_msg = true;

    checkMatch(match_id, message);
    timer = setInterval(async () => { checkMatch(match_id, message); }, 30 * 1000); // check every 30 seconds
};

let checkMatch = async (matchid, message) => {
    let s = await osu.getMatch(matchid); // load match data

    // return if there are no new finished maps
    if (s.games.length == 0 || last_map == s.games.slice(-1)[0].game_id) {
        try_count++;
        if (try_count >= max_tries) clearInterval(timer);
        return;
    }

    try_count = 0;
    let map = s.games.slice(-1)[0]; // get last map of match
    last_map = map.game_id;
    let m = await osu.getMap(map.beatmap_id, "", false); // get map data

    let scores = [];

    new Promise(resolve => {
        map.scores.forEach(async s => {
            let user = await osu.getUser(s.user_id);
            let mapMods = tools.osu.getMods(map.mods);
            let playerMods = s.enabled_mods != 0 && s.enabled_mods != null ? tools.osu.getMods(s.enabled_mods) : [];
            let fullMods = [...new Set(mapMods.concat(playerMods))];
            if (fullMods.includes("NF")) fullMods.splice(fullMods.indexOf("NF"), 1);
            if (fullMods.filter(e => e).length == 0) fullMods = ["NM"];

            scores.push({
                username: user.username,
                user_id: user.id,
                score: Number(s.score),
                combo: Number(s.maxcombo),
                acc: 100 * tools.osu.getAcc(s.count300, s.count100, s.count50, s.countmiss),
                mods: fullMods
            });

            if (scores.length == map.scores.length) resolve();
        });
    }).then(() => {
        scores.sort((a, b) => b.score - a.score);

        let embed = {
            color: message.member.displayColor,
            author: {
                name: `${s.match.name}`,
                url: `https://osu.ppy.sh/mp/${matchid}`,
                icon_url: `https://a.ppy.sh/${scores[0].user_id}`
            },
            thumbnail: {
                url: m.map.banner
            },
            description: `**[${m.map.title} [${m.map.diff}]](https://osu.ppy.sh/b/${map.beatmap_id}) just finished!**`,
            fields: [
                {
                    name: `Scores`,
                    value: scores.map(s => `[${s.username}](https://osu.ppy.sh/u/${s.user_id}) **+${s.mods.join("")}** — \`${s.score.toLocaleString()}\` (${s.acc.toFixed(2)}%)`).join("\n")
                }
            ],
            footer: {
                text: `${moment.utc(map.end_time).fromNow()}`
            },
            timestamp: moment.utc(map.end_time).toDate(),
        }

        if (last_message != 0 && delete_msg) {
            message.channel.messages.fetch(last_message).then(msg => msg.delete());
        }
        return message.channel.send({ embed: embed }).then(msg => last_message = msg.id);
    });
}

module.exports.help = {
    name: "track_match",
    aliases: ["trackmp", "track_mp", "tmp"],
    description: "Post updates in chat as a multiplayer lobby progresses.\n-d deletes old messages when a new map finishes.",
    usage: "track_match <mplink/id> [-d]",
    example: "track_match 62088294 -d",
    category: "osu!"
}