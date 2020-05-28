const emotes = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

module.exports.run = async (message, args) => {
    if (args.length < 3) return message.reply("missing arguments.");

    let descriptionText = "";
    let title = args.join(" ").match(/"([^"]+)"/)[1];
    let voted_users = [];
    let voted_users_check = [];

    let length = 60;
    if (!isNaN(args[args.length - 1]) && args[args.length - 1] <= 600) length = args[args.length - 1];

    let optionsMatched = [...args.join(" ").matchAll(/"([^"]+)"/g)];
    optionsMatched.shift();

    let options = [];
    optionsMatched.forEach(option => {
        var obj = { name: option[1], count: 0, percent: 0, users: [] }
        options.push(obj);
    });

    options.forEach((option, i) => {
        descriptionText += `**${i + 1}**  — **${option.name}**\n`
    });

    let answers = 0;

    var embed = {
        color: message.member.displayColor,
        author: {
            name: title
        },
        description: descriptionText,
        footer: {
            text: `Poll started by ${message.member.displayName} — ${answers} answer(s) so far`
        }
    }
    message.channel.send({ embed: embed }).then(async sentMsg => {
        for (var i = 0; i < options.length; i++) {
            await sentMsg.react(emotes[i]);
        }

        const filter = (reaction, user) => {
            return emotes.includes(reaction.emoji.name) && !user.bot;
        };

        const collector = sentMsg.createReactionCollector(filter, { time: length * 1000, dispose: true });

        collector.on('collect', (reaction) => {
            var reaction = reaction.emoji.name;
            var position = emotes.indexOf(reaction);

            answers++;
            options[position].count++;
            descriptionText = "";

            options.forEach((option, i) => {
                options[i].percent = (100 * (options[i].count / answers)).toFixed();
                descriptionText += `**${i + 1}**  — **${option.name}** *(${options[i].count} vote(s) / ${options[i].percent}%)*\n`
            });

            var embed = {
                color: message.member.displayColor,
                author: {
                    name: title
                },
                description: descriptionText,
                footer: {
                    text: `Poll started by ${message.member.displayName} — ${answers} total vote(s) so far`
                }
            }
            sentMsg.edit({ embed: embed });
        });

        collector.on('end', collected => {
            return; // poll ended
        });

        return;
    });
};

module.exports.help = {
    name: "poll",
    description: "Creates a poll. Default length is '60' (1 minute) with a limit at 600 and the maximum number of options is 5.",
    usage: "poll \"<title>\" \"<option 1>\" \"<option 2>\" ... [length]",
    category: "Tools"
}