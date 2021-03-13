const config = require('../config.json');
const fetch = require('node-fetch');
const osu = require('../osu.js');
const tools = require('../tools.js');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

module.exports.run = async (message, args) => {
    try {
        if (args.length == 0) return;

        let derank = args.includes('-o') ? parseInt(args[args.indexOf('-o') + 1]) : 0;
        let acc = args.includes('-a') ? parseFloat(args[args.indexOf('-a') + 1]) / 100 : -1;

        args = args.filter((e, i, a) => !e.startsWith('-') && !a[Math.max(i - 1, 0)].startsWith('-')); // remove params
        let raw_pp = args.filter(a => !isNaN(a))[0];
        args.splice(args.indexOf(raw_pp));

        let user = args.length > 0 ? args.join(' ') : statObj.users.find(u => u.discord == message.author.id).osu_id;
        if (!user) return tools.osu.noAccountAlert(message);

        // get user top scores
        let scores = await getTop(user);
        let userobj = await osu.getUser(user);

        // apply weighting
        let new_scores = scores.map(e => ({
            pp: e.pp,
            acc: tools.osu.getAcc(e.count300, e.count100, e.count50, e.countmiss),
        }));

        // use overall acc as score acc if not specified
        if (acc === -1) acc = userobj.acc / 100;

        let totalpp_old = userobj.pp;
        let totalpp_old_sum = new_scores.reduce((a, b, i) => a + b['pp'] * weight(i), 0); // ignores 'bonus pp'
        let acc_old = new_scores.reduce((a, b, i) => a + b['acc'] * weight(i), 0) / new_scores.reduce((a, b, i) => a + weight(i), 0);

        if (derank > 0) new_scores.splice(derank - 1, 1); // remove specified score
        new_scores.push({ pp: parseFloat(raw_pp), acc: acc }); // add new score
        new_scores = new_scores.sort((a, b) => b.pp - a.pp).slice(0, 100); // sort and limit to 100 scores

        let position = new_scores.findIndex(e => e.pp == parseFloat(raw_pp));

        let totalpp_new_sum = new_scores.reduce((a, b, i) => a + b['pp'] * weight(i), 0); // weighted sum of new scores
        let totalpp_new = totalpp_new_sum + (totalpp_old - totalpp_old_sum); // attempt to add 'bonus pp'
        let acc_new = new_scores.reduce((a, b, i) => a + b['acc'] * weight(i), 0) / new_scores.reduce((a, b, i) => a + weight(i), 0);

        let rank_old = userobj.rank;
        let rank_new = await getRank(totalpp_new);

        let f = {
            pp_old: format(totalpp_old, 2, 2),
            pp_new: format(totalpp_new, 2, 2),
            pp_diff: `${totalpp_new >= totalpp_old ? '+' : '-'}${format(Math.abs(totalpp_old - totalpp_new), 0, 2)}`,
            rank_old: '#' + format(rank_old, 0, 0),
            rank_new: '#' + format(rank_new, 0, 0),
            rank_diff: `${rank_new <= rank_old ? '+' : '-'}${format(Math.abs(rank_old - rank_new), 0, 0)}`,
            acc_old: (acc_old * 100).toFixed(2) + '%',
            acc_new: (acc_new * 100).toFixed(2) + '%',
            acc_diff: `${acc_new >= acc_old ? '+' : '-'}${format(Math.abs(acc_old - acc_new) * 100, 0, 2)}%`,
        }

        // calculate padding length
        let l_chars = Math.max(f.pp_old.length, f.rank_old.length, f.acc_old.length);
        let r_chars = Math.max(f.pp_new.length, f.rank_new.length, f.acc_new.length);

        let embed = {
            color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
            author: {
                name: `What if ${userobj.username} got a new ${format(raw_pp, 0, 2)}pp play?`,
                icon_url: userobj.avatar,
                url: userobj.url
            },
            description: `\n*with ${(acc * 100).toFixed(2)}% accuracy, ${derank == 0 ? `becoming their #${position + 1}` : `overwriting their #${derank}`} score*\`\`\`pp:   ${f.pp_old.padStart(l_chars, ' ')} > ${f.pp_new} ${' '.repeat(r_chars - f.pp_new.length)}| ${f.pp_diff}\nacc:  ${f.acc_old.padStart(l_chars, ' ')} > ${f.acc_new} ${' '.repeat(r_chars - f.acc_new.length)}| ${f.acc_diff}\nrank: ${f.rank_old.padStart(l_chars, ' ')} > ${f.rank_new} ${' '.repeat(r_chars - f.rank_new.length)}| ${f.rank_diff}\`\`\``,
        }

        return message.channel.send({ embed: embed });
    }
    catch (error) {
        return console.log(error);
    }
};

async function getTop(user) {
    return new Promise(async resolve => {
        fetch(`https://osu.ppy.sh/api/get_user_best?k=${config.keys.osu.apikey_old}&u=${user}&limit=100`).then(async response => {
            let data = await response.json();
            resolve(data);
        });
    });
}

async function getRank(pp) {
    return new Promise(async resolve => {
        fetch(`https://osudaily.net/data/getPPRank.php?t=pp&v=${pp}&m=0`).then(async response => {
            let data = await response.json();
            resolve(data);
        });
    });
}

const format = (number, min, max) => number.toLocaleString(undefined, { minimumFractionDigits: min, maximumFractionDigits: max });

const weight = index => Math.pow(0.95, index - 1);

module.exports.help = {
    name: 'netpp',
    description: 'Calculate how much a new play would affect your total pp, rank and overall acc.\n\nParameters:\n\`-a <acc>\` specify acc for the score\n\`-o <position>\` overwrite a play (1-100) on your top plays.',
    usage: 'netpp [<user>] <raw pp> [<parameters>]',
    example: 'netpp shdewz 500 -a 99.50% -o 2',
    category: 'osu!'
}