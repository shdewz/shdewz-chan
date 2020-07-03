const moment = require("moment");
const fetch = require("node-fetch");

module.exports.init = async (client) => {
    for (var i = 0; i < statObj.reminders.length; i++) {
        startTimer(statObj.reminders[i].user, statObj.reminders[i].subject, statObj.reminders[i].start, statObj.reminders[i].end, client);
    }
    console.log(statObj.reminders.length + " reminder(s) running.");
    return;
}

module.exports.run = async (message, args, client) => {
    if (args.length < 1) return;

    if (args.includes("-list")) {
        if (statObj.reminders.length == 0) return message.reply("no active reminders founds.");
        var reminders = statObj.reminders.sort(GetSortOrder("end"));
        var remindersText = `**Reminders for ${message.member.displayName}:**\n`;
        var amount = 1;
        var found = false;
        for (var i = 0; i < reminders.length; i++) {
            if (reminders[i].user == message.author.id) {
                var date = moment.utc(reminders[i].end);
                remindersText += `**${amount}.** *${reminders[i].subject}* on ${date.format("**dddd, MMMM Do YYYY** [at] **HH:mm:ss UTC**")} (${date.fromNow()})\n`;
                found = true;
            }
        }
        if (found) return message.channel.send(remindersText);
        return message.reply("no active reminders founds.");
    }

    if (args.includes("-all") && message.author.id == "250693235091963904") {
        if (statObj.reminders.length == 0) return message.reply("no active reminders founds.");
        var reminders = statObj.reminders.sort(GetSortOrder("end"));

        var remindersText = `**All reminders:**\n`;
        var amount = 1;
        for (var i = 0; i < reminders.length; i++) {
            remindersText += `**${amount}.** ${client.users.cache.get(reminders[i].user).username}: *${reminders[i].subject}* on ${moment.utc(reminders[i].end).format("**dddd, MMMM Do YYYY** [at] **HH:mm:ss UTC**")} (${moment.utc(reminders[i].end).fromNow()})\n`;
            amount++;
        }
        return message.channel.send(remindersText);
    }

    if (args.includes("-remove")) {
        var index = !isNaN(args[args.indexOf("-remove") + 1]) ? args[args.indexOf("-remove") + 1] : 0;
        var found = false;
        if (index == 0) {
            for (var i = 0; i < statObj.reminders.length; i++) {
                if (statObj.reminders[i].user == message.author.id) {
                    if (statObj.reminders.length == 1) statObj.reminders = [];
                    else statObj.reminders.splice(i, 1);
                    found = true;
                }
            }
            if (!found) return message.reply("no active reminders founds.");
            return message.reply("your previous reminder(s) have been removed.");
        }
        else {
            var counter = 1;
            for (var i = 0; i < statObj.reminders.length; i++) {
                if (statObj.reminders[i].user == message.author.id) {
                    if (counter == index) {
                        if (statObj.reminders.length == 1) statObj.reminders = [];
                        else statObj.reminders.splice(i, 1);
                        return message.reply("your reminder has been removed.");
                    }
                    counter++;
                }
            }
            return message.reply("no active reminders founds.");
        }
    }

    var subject;
    var current = moment.utc();
    var final;

    if (args.join(" ").toLowerCase().includes(" in ")) {
        var time = args.join(" ").toLowerCase().split(" in ")[1].split(" ");
        subject = args.join(" ").split(" in ")[0];

        var duration = moment.duration({
            seconds: time.includes("seconds") ? time[time.indexOf("seconds") - 1] : 0,
            minutes: time.includes("minutes") ? time[time.indexOf("minutes") - 1] : 0,
            hours: time.includes("hours") ? time[time.indexOf("hours") - 1] : 0,
            days: time.includes("days") ? time[time.indexOf("days") - 1] : 0,
            weeks: time.includes("weeks") ? time[time.indexOf("weeks") - 1] : 0,
            months: time.includes("months") ? time[time.indexOf("months") - 1] : 0,
            years: time.includes("years") ? time[time.indexOf("years") - 1] : 0
        });

        final = current.add(duration);
    }
    else if (args.join(" ").toLowerCase().includes(" at ")) {
        subject = args.join(" ").split(" at ")[0];
        var datestring = args.join(" ").toLowerCase().replace("/", "-").split(" at ")[1];
        if (!datestring.match(/\d+\-\d+\-\d+/)) datestring = moment.utc().format("YYYY-MM-DD") + " " + datestring;
        else if (!datestring.match(/\d+\:\d+/)) datestring = datestring + " " + moment.utc().format("HH:mm");
        final = moment.utc(datestring);
    }

    var obj = {
        user: message.author.id,
        subject: subject,
        start: moment.utc().valueOf(),
        end: final.valueOf()
    }

    statObj.reminders.push(obj);
    message.reply(`I will remind you on ${final.format("**dddd, MMMM Do YYYY** [at] **HH:mm:ss UTC**")}!`);

    startTimer(message.author.id, subject, current, final, client);
};

function startTimer(userid, subject, start, end, client) {
    var time = end > moment.utc().valueOf() ? moment.utc(end).diff(moment.utc().valueOf()) : 1000;
    var user = client.users.cache.get(userid);
    var late = end + 20000 < moment.utc().valueOf() ? `\n\nLooks like i was late by about **${moment.utc().to(moment.utc(end), true)}**. oops! >w<` : "";

    reminder = setTimeout(async () => {
        for (i = 0; i < statObj.reminders.length; i++) {
            if (statObj.reminders[i].user == userid && statObj.reminders[i].end == end) {
                if (statObj.reminders.length == 1) statObj.reminders = [];
                else statObj.reminders.splice(i, 1);
            }
        }

        var response = await fetch("https://official-joke-api.appspot.com/random_joke");
        var jokejson = await response.json();
        var joke = jokejson.setup + " " + jokejson.punchline;

        let embed = {
            color: 0xeb9ba4,
            author: {
                name: `Your reminder is done!`,
            },
            description: `On ${moment(start).format("**dddd, MMMM Do YYYY** [at] **HH:mm:ss UTC**")} you asked me to remind you to **${subject}**.${late}`,
            footer: {
                text: joke,
            }
        }

        console.log(`\n[${new Date().toLocaleTimeString()}] Reminder sent to ${user.username}.`);
        return user.send({ embed: embed });

    }, time > 15 * 24 * 60 * 60 * 1000 ? 15 * 24 * 60 * 60 * 1000 : time);
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
    name: "remindme",
    description: "Set a timed reminder.\nSupported units are: \`seconds\`, \`minutes\`, \`hours\`, \`days\`, \`weeks\`, \`months\` and \`years\`.\nCorrect date format is \`YYYY/MM/DD HH:mm\`.",
    usage: "remindme <subject> in/at <time/date>",
    example: "remindme fix the bot again in 2 hours 30 minutes",
    example2: "remindme play the pool at 2020/05/20 13:30",
    category: "Tools"
}