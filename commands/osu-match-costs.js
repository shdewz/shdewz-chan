const moment = require("moment");
const osu = require("../osu.js");

const medals = ["🥇", "🥈", "🥉"];

module.exports.run = async (message, args, client) => {
    if (args.length == 0) return;
    args = args.map(a => a.toLowerCase());
    let match_id = args[0].match(/\d+/)[0];

    // get the match data from api
    let s = await osu.getMatch(match_id);
    if (s.error) return message.channel.send(s.error);

    // remove maps from start and end
    if (args[1] && !isNaN(args[1])) s.games.splice(0, args[1]);
    if (args[2] && !isNaN(args[2])) s.games.splice(-args[2], args[2]);

    let mode = s.games[0].team_type;
    let valid = s.match.name.match(/.*: \(.*\) vs \(.*\)$/i) ? true : false;

    let match = {
        acronym: valid ? s.match.name.match(/(.*?):/)[0].replace(":", "") : "-",
        team1: valid ? s.match.name.match(/\((.*?)\)/g)[0].replace(/[\(\)]/g, "") : "Blue",
        team2: valid ? s.match.name.match(/\((.*?)\)/g)[1].replace(/[\(\)]/g, "") : "Red",
        team1points: 0,
        team2points: 0,
        players: [],
        medians: [],
        medianmaps: 0
    };

    // get a list of players from the lobby
    let unique_players = s.games.map(g => g.scores.filter(s => s.score > 0).map(s => s.user_id)).reduce((a, b) => a.concat(b), []).filter((p, i, a) => a.indexOf(p) == i);

    return new Promise(resolve => {
        // make a pretty object for all of them
        unique_players.forEach(async player => {
            let user = await osu.getUser(player);

            match.players.push({
                team: "",
                user_id: player,
                username: user.username,
                scores: [],
                rating: 0,
                medal: "",
            });

            if (match.players.length == unique_players.length) resolve();
        });
    }).then(() => {
        // swap players in h2h if order wrong
        if (match.players.length == 2) {
            if (match.players[0].username !== match.team1 && match.players[1].username !== match.team2) {
                [match.players[0], match.players[1]] = [match.players[1], match.players[0]];
            }
        }

        s.games.filter(game => game.scores.length > 0).forEach(map => {
            // add median score of map to median array
            match.medians.push(median(map.scores.map(sc => Number(sc.score))));

            // increment points of winning team
            if (mode == 2) { // teamvs
                let team1score = map.scores.filter(sc => sc.team == 1).map(sc => Number(sc.score)).reduce((a, b) => a + b);
                let team2score = map.scores.filter(sc => sc.team == 2).map(sc => Number(sc.score)).reduce((a, b) => a + b);
                if (team1score > team2score) match.team1points++;
                else match.team2points++;
            }
            else if (match.players.length == 2) { // h2h
                let team1score = map.scores.filter(sc => sc.user_id == match.players[0].user_id).map(sc => Number(sc.score))[0];
                let team2score = map.scores.filter(sc => sc.user_id == match.players[1].user_id).map(sc => Number(sc.score))[0];
                if (team1score > team2score) match.team1points++;
                else match.team2points++;
            }

            // add player score (and team if teamvs)
            match.players.forEach(player => {
                let score = map.scores.find(s => s.user_id == player.user_id);
                if (!score) player.scores.push(0);
                else {
                    player.scores.push(Number(score.score));
                    if (mode == 2) player.team = Number(score.team);
                }
            });
        });

        // get the median amount of maps played per player
        let arr = [];
        match.players.forEach(player => arr.push(player.scores.filter(score => score > 0).length));
        match.medianmaps = median(arr);

        // run the cost function for each player
        match.players.forEach(player => { player.rating = getCost(player.scores, match.medians, match.medianmaps) });
        match.players.sort((a, b) => a.rating - b.rating).reverse(); // sort by rating
        for (var i = 0; i < Math.min(match.players.length, 3); i++) { match.players[i].medal = medals[i]; } // add medals for top3

        let embed = {};

        if (mode == 2) { // teamvs
            embed = {
                color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                author: {
                    name: `${valid ? `${match.acronym}: ${match.team1} vs ${match.team2}` : s.match.name}`,
                    url: `https://osu.ppy.sh/mp/${match_id}`
                },
                description: `**Final score:** ${match.team2points > match.team1points ? `🔴 **${match.team2points}** - ${match.team1points} 🔵` : `🔴 ${match.team2points} - **${match.team1points}** 🔵`}`,
                fields: [
                    {
                        name: `🔴 **Red Team**`,
                        value: match.players.filter(p => p.team == 2).map((p, i) => `#${i + 1} \u200b **${p.rating.toFixed(2)}** \u200b [${p.username}](https://osu.ppy.sh/u/${p.user_id}) ${p.medal}`),
                        inline: false,
                    },
                    {
                        name: `🔵 **Blue Team**`,
                        value: match.players.filter(p => p.team == 1).map((p, i) => `#${i + 1} \u200b **${p.rating.toFixed(2)}** \u200b [${p.username}](https://osu.ppy.sh/u/${p.user_id}) ${p.medal}`),
                        inline: false,
                    }
                ]
            }
        }
        else { // head to head
            embed = {
                color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                author: {
                    name: `${valid ? `${match.acronym}: ${match.team1} vs ${match.team2}` : s.match.name}`,
                    url: `https://osu.ppy.sh/mp/${match_id}`
                },
                description: match.players.length == 2 ? `**Final score:** ${match.team1points > match.team2points ? `**${match.players[0].username} ${match.team1points}** - ${match.team2points} ${match.players[1].username}` : `${match.players[0].username} ${match.team1points} - **${match.team2points} ${match.players[1].username}**`}` : "",
                fields: [
                    {
                        name: "\u200b",
                        value: match.players.map((p, i) => `#${i + 1} \u200b **${p.rating.toFixed(2)}** \u200b [${p.username}](https://osu.ppy.sh/u/${p.user_id}) ${p.medal}`),
                        inline: false,
                    }
                ]
            }
        }

        return message.channel.send({ embed: embed });
    });
};

const getCost = (playerScores, medians, mapsPlayed) => { let sum = 0; playerScores.forEach((s, i) => { if (s > 0) sum += s / medians[i] }); return (sum / playerScores.filter(s => s > 0).length) * Math.cbrt(playerScores.filter(s => s > 0).length / mapsPlayed); };

const median = arr => {
    const mid = Math.floor(arr.length / 2);
    const nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

module.exports.help = {
    name: "match_costs",
    aliases: ["matchcosts", "mc", "costs"],
    description: "Compare the individual performance of players in an osu! tournament match.",
    usage: "match_costs <mplink/id> [<ignore_from_start>] [<ignore_from_end>]",
    example: "match_costs 62088294 2 0",
    category: "osu!"
}