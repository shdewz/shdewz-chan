const fs = require("fs");
const moment = require("moment");

module.exports.run = async (message, args) => {
    let server = message.guild.id;

    for (var i = 0; i < statObj.serverstats.length; i++) {
        if (statObj.serverstats[i].id == server) {
            if (statObj.serverstats[i].content.nwordslb) {
                if (args.includes("-when")) {
                    for (var j = 0; j < statObj.serverstats[i].content.nwordslb.length; j++) {
                        if (statObj.serverstats[i].content.nwordslb[j].id == message.author.id) {
                            if (!statObj.serverstats[i].content.nwordslb[j].last) return message.reply("now!");

                            var last = statObj.serverstats[i].content.nwordslb[j].last;
                            if (last < moment().valueOf() - 15 * 60 * 1000) return message.reply("now!");

                            var next = moment(last + 15 * 60 * 1000);
                            return message.reply(moment().to(next) + "!");
                        }
                    }
                    return message.reply("now!");
                }
                var nwords = 0;
                for (var obj of statObj.serverstats[i].content.nwordslb) {
                    nwords += obj.count;
                }
                var lb = false;
                var length = 10;
                if (args.includes("-lb")) {
                    lb = true;
                    if (args.includes("-l")) {
                        length = args[args.indexOf("-l") + 1];
                    }
                }
                return this.display(nwords, message, lb, statObj.serverstats[i].content.nwordslb, length);
            }
        }
    }
    return message.channel.send("No n-words found in this server.");
};

module.exports.display = (nwords, message, lb, lbobj, length) => {

    if (lb) {
        let rankText = "";
        let nameText = "";
        let nwordText = "";

        lbobj.sort(GetSortOrder("count"));
        lbobj.reverse();

        for (var i = 0; i < lbobj.length; i++) {
            if (i > length - 1) break;
            rankText += `#${i + 1}\n`
            nameText += `${message.guild.members.cache.get(lbobj[i].id) ? message.guild.members.cache.get(lbobj[i].id).displayName : "invalid-user"}\n`;
            nwordText += `${lbobj[i].count}\n`
        }

        let embed = {
            color: message.member.displayColor,
            author: {
                name: `Top ${length > lbobj.length ? lbobj.length : length} n-word users in ${message.guild.name}`
            },
            fields: [
                {
                    name: "Rank", value: rankText, inline: true
                },
                {
                    name: "Name", value: nameText, inline: true
                },
                {
                    name: "N-words", value: nwordText, inline: true
                },
                {
                    name: "Total", value: nwords
                }
            ]
        }

        return message.channel.send({ embed: embed });
    }

    var msgOptions = [
        `\`${nwords}\` n-words have been let out in this server.`,
        `\`${nwords}\` n-words have been said in this server.`,
        `\`${nwords}\` n-words and counting.`,
        `\`${nwords}\` n-words so far here.`,
        `I have seen \`${nwords}\` n-words in this server.`,
        `I have noticed \`${nwords}\` n-words here.`,
        `Looks like \`${nwords}\` n-words have been said.`,
        `Looks like \`${nwords}\` n-words have been let out here.`,
        `N-words: \`${nwords}\` and counting.`,
        `N-word counter at \`${nwords}\` n-words.`
    ];

    var msg = msgOptions[Math.floor(Math.random() * msgOptions.length)];

    return message.channel.send(msg);
}

module.exports.newNword = async (message) => {
    let server = message.guild.id;

    for (var i = 0; i < statObj.serverstats.length; i++) {
        if (statObj.serverstats[i].id == server) {
            if (statObj.serverstats[i].content && statObj.serverstats[i].content.nwords) {
                var lbfound = false;
                for (var j = 0; j < statObj.serverstats[i].content.nwordslb.length; j++) {
                    if (statObj.serverstats[i].content.nwordslb[j].id == message.author.id) {
                        lbfound = true;
                        if (moment().valueOf() - statObj.serverstats[i].content.nwordslb[j].last < 15 * 60 * 1000) return;
                        statObj.serverstats[i].content.nwordslb[j].count++;
                        statObj.serverstats[i].content.nwordslb[j].last = moment().valueOf();
                    }
                }
                if (!lbfound) {
                    var obj = { "id": message.author.id, "count": 1, "last": moment().valueOf() };
                    statObj.serverstats[i].content.nwordslb.push(obj)
                }

                var nwords = 0;
                for (var obj of statObj.serverstats[i].content.nwordslb) {
                    nwords += obj.count;
                }
                return this.display(nwords, message);
            }

            // add nword to server
            if (!statObj.serverstats[i].content) statObj.serverstats[i].content = { "nwordslb": [{ "id": message.author.id, "count": 1, "last": moment().valueOf() }] };
            else {
                statObj.serverstats[i].content.nwordslb = [{ "id": message.author.id, "count": 1, "last": moment().valueOf() }];
            }
            fs.writeFile("stats.json", JSON.stringify(statObj), function (err) {
                if (err) return console.log("error", err);
            });
            return this.display(1, message);
        }
    }

    // add server
    var obj = { "id": message.channel.guild.id, "channels": [], "content": { "nwords": 1, "nwordslb": [{ "id": message.author.id, "count": 1 }] } };
    statObj.serverstats.push(obj);
    fs.writeFile("stats.json", JSON.stringify(statObj), function (err) {
        if (err) return console.log("error", err);
    });
    return this.display(1, message);
}

function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}

module.exports.help = {
    name: "nwords",
    description: "Counting N-words since 2020",
    category: "Fun"
}