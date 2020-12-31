const { forEach, ctransposeDependencies } = require("mathjs");
const config = require("../config.json");
const osu = require("../osu.js");
const moment = require("moment");

const { CanvasRenderService } = require('chartjs-node-canvas');
const Canvas = require("canvas");

Canvas.registerFont('./fonts/B2-Medium.ttf', { family: 'B2-Medium' });
Canvas.registerFont('./fonts/B2-Bold.ttf', { family: 'B2-Bold' });

module.exports.run = async (message, args) => {
    try {
        let usernames = [];
        let params = ["-v2", "-light"]

        if (args.filter(a => !params.includes(a)).length > 0) {
            let name_arr = args.filter(a => !params.includes(a)).join(" ").split(", ");
            usernames = name_arr.map(n => n.split(" ").join("_"));
        }
        else {
            let user = statObj.users.find(u => u.discord == message.author.id);
            if (!user) return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${config.prefix}osuset <user>\`.`);

            usernames = [user.osu_id];
        }

        if (args.includes("-v2")) {
            usernames.slice(0, 8).forEach(async username => {
                let s = await osu.getUser_v2(username);
                if (s.error) return message.channel.send(s.error);

                let maincl = "0, 130, 250"
                let altcl = "250, 0, 80"
                let bgcolor = "20, 20, 20"
                let bgalt = "30, 30, 30"

                let chart = await makeChart(s, maincl, altcl);
                let badges = await badgeRow(s);
                let userpage = await drawUserpage(s);

                let width = 800;
                let height = userpage.height + badges.height + 300;

                // draw stuff
                var canvas = Canvas.createCanvas(width, height);
                var ctx = canvas.getContext('2d');
                ctx.font = "B2-Medium";

                ctx.fillStyle = `rgba(${bgcolor}, 1)`;
                ctx.fillRect(0, 0, width, height);

                if (s.groups.length > 0) {
                    ctx.globalAlpha = 0.1;
                    ctx.fillStyle = s.groups[0].colour;
                    ctx.fillRect(0, 0, width, userpage.height);
                    ctx.globalAlpha = 1;
                }

                if (s.badges.length > 0) {
                    ctx.fillStyle = `rgba(${bgalt}, 1)`;
                    ctx.fillRect(0, userpage.height, width, badges.height);
                    ctx.drawImage(badges, 0, userpage.height);
                }

                ctx.drawImage(userpage, 0, 0);

                var chartimage = await Canvas.loadImage(chart);
                ctx.drawImage(chartimage, 0, userpage.height + badges.height);

                let buffer = canvas.toBuffer('image/png');
                message.channel.send({ files: [buffer] });
            });
        }
        else {
            usernames.slice(0, 8).forEach(async username => {
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
            });
        }
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

async function makeChart(s, maincl, altcl) {
    return new Promise(async resolve => {
        let width = 800;
        let height = 300;

        let indexes_1 = s.replays_watched_counts.map(obj => obj.start_date);
        let monthly_data_1 = s.monthly_playcounts.map(obj => {
            let index = indexes_1.indexOf(obj.start_date);
            return { start_date: obj.start_date, count: obj.count, replays: index > -1 ? s.replays_watched_counts[index].count : 0 };
        });

        let indexes_2 = s.monthly_playcounts.map(obj => obj.start_date);
        let monthly_data_2 = s.replays_watched_counts.map(obj => {
            let index = indexes_2.indexOf(obj.start_date);
            return { start_date: obj.start_date, count: index > -1 ? s.monthly_playcounts[index].count : 0, replays: obj.count };
        });

        let dates = new Set(monthly_data_1.map(d => d.start_date));
        let monthly_data = [...monthly_data_1, ...monthly_data_2.filter(d => !dates.has(d.start_date))].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        const crs = new CanvasRenderService(width, height, (ChartJS) => { });
        (async () => {
            let data = {
                labels: monthly_data.map(m => moment(m.start_date).format("MMM \xa0 YYYY")),
                datasets: [{
                    label: "Playcount",
                    backgroundColor: `rgba(${maincl}, 0.1)`,
                    borderColor: `rgba(${maincl}, 1)`,
                    pointRadius: 0,
                    yAxisID: 'A',
                    data: monthly_data.map(m => m.count),
                    fill: 'start',
                }, {
                    label: "Replays Watched",
                    backgroundColor: `rgba(${altcl}, 0.1)`,
                    borderColor: `rgba(${altcl}, 1)`,
                    pointRadius: 0,
                    yAxisID: 'B',
                    data: monthly_data.map(m => m.replays),
                    fill: 'start',
                }]
            }

            const configuration = {
                type: 'line',
                data: data,
                options: {
                    title: {
                        text: `aaaaaaaaaaaaaaa`,
                        display: false,
                        fontSize: 24
                    },
                    scales: {
                        yAxes: [
                            {
                                id: 'A',
                                position: 'left',
                                gridLines: {
                                    color: `rgba(70, 70, 70, 0.2)`,
                                    zeroLineWidth: 1,
                                    zeroLineColor: `rgba(100, 100, 100, 0.8)`
                                },
                                scaleLabel: {
                                    labelString: "Playcount",
                                    fontSize: 16,
                                    display: true
                                }
                            },
                            {
                                id: 'B',
                                position: 'right',
                                scaleLabel: {
                                    labelString: "Replays Watched",
                                    fontSize: 16,
                                    display: true
                                }
                            }
                        ],
                        xAxes: [{
                            gridLines: {
                                color: `rgba(70, 70, 70, 0.1)`,
                            },
                            scaleLabel: {
                                labelString: "Time",
                                fontSize: 16,
                                display: false,
                            }
                        }]
                    },
                    layout: {
                        padding: {
                            left: 10,
                            right: 5,
                            top: 10,
                            bottom: 10
                        }
                    }
                }
            };
            const image = await crs.renderToBuffer(configuration);
            resolve(image);
        })();
    });
}

async function drawUserpage(s) {
    return new Promise(async resolve => {
        let width = 800;
        let avatarsize = 128;
        let height = avatarsize + 2 * 28;

        var canvas = Canvas.createCanvas(width, height);
        var ctx = canvas.getContext('2d');

        ctx.shadowColor = "#000000";
        ctx.shadowBlur = "16";

        if (s.avatar_url != "/images/layout/avatar-guest.png") {
            let avatar = await Canvas.loadImage(s.avatar_url);
            ctx.drawImage(avatar, 28, 28, avatarsize, avatarsize);
        }

        ctx.font = "48px B2-Bold";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.shadowBlur = "8";
        ctx.fillText(s.username, 28 + avatarsize + 14, 12);

        if (s.previous_usernames.length > 0) {
            ctx.font = "16px B2-Medium";
            ctx.fillStyle = "#575757";
            let str_length = 0;
            let str = "a.k.a. ";
            for (var i = 0; i < s.previous_usernames.length; i++) {
                str_length += s.previous_usernames[i].length;
                if (str_length < 42) str += `${s.previous_usernames[i]}${i < s.previous_usernames.length - 1 ? ", " : ""}`;
                else { str += `(+${s.previous_usernames.length - i})`; break; }
            }
            ctx.fillText(str, 28 + avatarsize + 14, 72);
        }

        ctx.font = "44px B2-Medium";
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "bottom";
        ctx.fillText(`#${s.statistics.pp_rank.toLocaleString()}`, 28 + avatarsize + 14, 28 + avatarsize + 6);

        resolve(canvas);
    });
}

async function badgeRow(s) {
    if (s.badges.length == 0) return { width: 800, height: 0 };

    let rows = Math.ceil(s.badges.length / 8);
    let width = 800;
    let height = 28 + (rows * 40) + ((rows - 1) * 12);

    var canvas = Canvas.createCanvas(width, height);
    var ctx = canvas.getContext('2d');

    return new Promise(async resolve => {
        for (var i = 0; i < rows; i++) {
            let badges = s.badges.slice(i * 8, (i * 8) + 8);
            let offsettop = 14 + (i * (40 + 12));
            for (var j = 0; j < badges.length; j++) {
                let offsetleft = 14 + (j * (86 + 12));
                ctx.shadowColor = "#000000";
                ctx.shadowBlur = "8";
                var badge_img = await Canvas.loadImage(badges[j].image_url);
                ctx.drawImage(badge_img, offsetleft, offsettop, 86, 40);
            }
        }
        resolve(canvas);
    });
}