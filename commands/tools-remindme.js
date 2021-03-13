const moment = require("moment");
const tools = require("../tools.js");
const chrono = require("chrono-node");

const interval = 5 * 60 * 60 * 1000; // 5 minutes

module.exports.init = async (client) => { return runInterval(client); }

module.exports.run = async (message, args, client) => {
    if (args.length == 0) return;

    let query = args.join(" ");
    let result = chrono.parse(query, new Date(), { forwardDate: true });
    if (result.length == 0) return message.reply("error processing date/time.");
    let reminderTime = moment.utc(result[0].start.date());

    if (!query.includes("utc") && !query.match(/ in ([0-9]+|a|an) /gi)) {
        let user = statObj.users.find(u => u.discord == message.author.id);
        if (user && user.location) {
            let location = await tools.getLocation(`${user.location.lat},${user.location.lon}`, true);
            let offset = location[0].timezone_module.offset_sec;
            reminderTime.subtract(offset, "seconds").subtract(new Date().getTimezoneOffset(), "minutes");
        }
    }
    if (reminderTime.isBefore(moment.utc())) reminderTime.add(1, "days");

    let reminder = {
        user: message.author.id,
        subject: query,
        start: moment.utc().valueOf(),
        end: reminderTime.valueOf()
    }

    message.channel.send(`Got it ${message.author}! I will remind you on ${reminderTime.format("**dddd, MMMM Do YYYY** [at] **HH:mm:ss UTC**")}!`);

    let diff = Math.max(reminder.end - reminder.start, 0);
    if (diff < interval) {
        setTimeout(async () => { sendReminder(reminder, client) }, diff);
    }
    else statObj.reminders.push(reminder);
};

runInterval = async client => {
    checkReminders(client);
    checker = setInterval(async () => { checkReminders(client); }, interval);
}

checkReminders = async client => {
    statObj.reminders.forEach((reminder, i) => {
        let diff = Math.max(new Date(reminder.end) - new Date(), 0);
        if (diff < interval) {
            statObj.reminders.splice(i, 1);
            setTimeout(async () => { sendReminder(reminder, client) }, diff);
        }
    });
}

sendReminder = (reminder, client) => {
    let embed = {
        color: 0xf56c7c,
        author: { name: `Your reminder is done!`, },
        description: `On ${moment(reminder.start).format("**dddd, MMMM Do YYYY** [at] **HH:mm:ss UTC**")} you asked for a reminder to **${reminder.subject}**. The time has arrived.`,
    }

    return client.users.cache.get(reminder.user).send({ embed: embed });
}

module.exports.help = {
    name: "remindme",
    description: "Set a timed reminder.",
    usage: "remindme <subject> <time/date/whatever>",
    example: "remindme buy donuts tomorrow at 8 pm",
    category: "Tools"
}