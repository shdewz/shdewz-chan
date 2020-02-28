const config = require("../config.json");
const fetch = require('node-fetch');
const Discord = require('discord.js');
const Canvas = require('canvas');
const registerFont = require('canvas');

module.exports.run = async (message, args, client) => {
    try {
        var mode = 0

        Canvas.registerFont('./fonts/Rubik-Medium.ttf', { family: 'Rubik-Medium' });
        Canvas.registerFont('./fonts/Rubik-Italic.ttf', { family: 'Rubik-Italic' });

        const canvas = Canvas.createCanvas(600, 200);
        const c = canvas.getContext('2d');

        var uid;

        if (args.length < 1) {
            let found;
            var stat = client.commands.get("loadstats").run(); // load stats
            for (var i = 0; i < stat.users.length; i++) {
                if (stat.users[i].discord == message.author.id) {
                    uid = stat.users[i].osu_id;
                    found = true;
                    break;
                }
            }
            if (!found) return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${config.prefix}osuset <user>\`.`)
        }
        else if (args.length <= 1) {
            uid = args.join("_");
        }
        else if (args.length <= 2) {
            uid = args.join("_");
            if (args[1] == "taiko") mode = 1;
            else if (args[1] == "ctb") mode = 2;
            else if (args[1] == "mania") mode = 3;
        }
        else return;

        var modetext = ["osu!", "osu!taiko", "osu!catch", "osu!mania"][mode];

        var apikey = config.apikey;

        // get stats
        const userStatRequest = async () => {
            try {
                const response = await fetch(`https://osu.ppy.sh/api/get_user?k=${apikey}&m=${mode}&u=${uid}`);
                const userjson = await response.json();

                for (var u in userjson) {
                    // put stuff to variables
                    var username = userjson[u].username;
                    var userid = userjson[u].user_id;
                    var joindate = new Date(userjson[u].join_date);
                    var playcount = userjson[u].playcount;
                    var pp = userjson[u].pp_raw;
                    var rank = userjson[u].pp_rank;
                    var countryrank = userjson[u].pp_country_rank;
                    var country = userjson[u].country.toLowerCase();
                    var accuracy = userjson[u].accuracy;
                    var score = userjson[u].ranked_score;
                    var level = userjson[u].level;
                }

                // draw everything

                var grd = c.createLinearGradient(0, 0, 600, 0);
                grd.addColorStop(0, "#c31432");
                grd.addColorStop(1, "#240b36");

                c.fillStyle = grd;
                c.fillRect(0, 0, 600, 200);

                c.fillStyle = "#FFFFFF";

                c.shadowColor = "#000000";
                c.shadowBlur = "8";

                var uoffset = 0;
                if (username.length >= 17) { c.font = "25px Rubik-Medium"; uoffset = -3; }
                else if (username.length >= 13) { c.font = "30px Rubik-Medium"; uoffset = -2; }
                else if (username.lenght >= 11) { c.font = "35px Rubik-Medium"; uoffset = -1; }
                else { c.font = "40px Rubik-Medium"; }

                c.fillText(username, 140, 45 + uoffset);

                c.font = "14px Rubik-Italic";
                c.fillText(`${modetext} stats`, 140, 65);
                c.fillText(`Joined ${formatDate(joindate)} (${timeSince(joindate)})`, 140, 85);

                c.font = "14px Rubik-Medium";
                c.fillText(`Accuracy:  ${Math.round(accuracy * 100) / 100}%`, 15, 150);
                c.fillText(`Playcount:  ${parseInt(playcount).toLocaleString()}`, 15, 170);
                c.fillText(`Ranked score:  ${as(score)}`, 15, 190);

                var roffset = 0;
                if (rank.length >= 6) { c.font = "40px Rubik-Medium"; roffset = -2; }
                else if (rank.lenght >= 5) { c.font = "45px Rubik-Medium"; }
                else { c.font = "50px Rubik-Medium"; }

                c.textAlign = "right";
                c.fillText(`#${parseInt(rank).toLocaleString()}`, 590, 50 + roffset);

                c.font = "30px Rubik-Medium";
                c.fillText(`#${parseInt(countryrank).toLocaleString()}`, 540, 86);

                c.font = "20px Rubik-Medium";
                c.fillText(`${Math.round(pp).toLocaleString()} pp`, 590, 116);

                c.fillRect(140, 95, 200, 30);

                c.fillStyle = "#de354f";
                c.fillRect(145, 100, 190 * (level % Math.floor(level)), 20);

                c.fillStyle = "#FFFFFF";
                c.textAlign = "center";
                c.fillText(`Level ${Math.floor(level)}`, 238, 117);

                c.textAlign = "left";

                var pfp = await Canvas.loadImage("https://a.ppy.sh/" + userid);
                c.drawImage(pfp, 15, 15, 110, 110);

                var flag = await Canvas.loadImage(`https://osu.ppy.sh/images/flags/${country.toUpperCase()}.png`);
                c.drawImage(flag, 550, 60, 40, 30);

                const attachment = new Discord.Attachment(canvas.toBuffer(), 'statcard.png');
                message.channel.send(attachment);
            }
            catch (error) {
                return console.log(error);
            }
        }
        userStatRequest();
    }
    catch (error) {
        return console.log(error);
    }
};

// new time calc
function timeSince(past) {
    var suffix;
    var prefix;
    var today = new Date();
    var timeDiff = today - past;
    var dayDiff = timeDiff / (1000 * 3600 * 24);
    var monthDiff = dayDiff / (365.2422 / 12);
    var yearDiff = dayDiff / 365.2422;

    if (dayDiff < 365.2422 / 12) {
        if (Math.round(dayDiff) == 1) { suffix = " day ago"; }
        else { suffix = " days ago"; }
        prefix = "";
        return prefix + Math.round(dayDiff) + suffix;
    }
    else if (dayDiff < 365.2422) {
        if (Math.round(monthDiff) == 1) { suffix = " month ago"; }
        else { suffix = " months ago"; }
        prefix = "";
        return prefix + Math.round(monthDiff) + suffix;
    }
    else if (dayDiff >= 365.2422) {
        if (Math.round(yearDiff * 10) / 10 == 1) { suffix = " year ago"; }
        else { suffix = " years ago"; }
        prefix = "";
        return prefix + Math.round(yearDiff * 10) / 10 + suffix;
    }
    else {
        return "<date calc error>";
    }
}

// format the date to mm/dd/yyyy
function formatDate(value) {
    return value.getMonth() + 1 + "/" + value.getDate() + "/" + value.getFullYear();
}

// add large number suffixes
function as(num) {
    if (num <= 10000) // 1,000
    {
        return num.toLocaleString();
    }
    else if (num <= 100000) // 10.0K
    {
        num /= 1000;
        return (Math.round(num * 10) / 10).toLocaleString() + "K";
    }
    else if (num <= 1000000) // 100K
    {
        num /= 1000;
        return num.toLocaleString() + "K";
    }
    else if (num <= 10000000) // 1.00M
    {
        num /= 1000000;
        return (Math.round(num * 100) / 100).toLocaleString() + "M";
    }
    else if (num <= 100000000) // 10.0M
    {
        num /= 1000000;
        return (Math.round(num * 10) / 10).toLocaleString() + "M";
    }
    else if (num <= 1000000000) // 100M
    {
        num /= 1000000;
        return Math.round(num).toLocaleString() + "M";
    }
    else if (num <= 10000000000) // 1.00B
    {
        num /= 1000000000;
        return (Math.round(num * 100) / 100).toLocaleString() + "B";
    }
    else if (num <= 100000000000) // 10.0B
    {
        num /= 1000000000;
        return (Math.round(num * 10) / 10).toLocaleString() + "B";
    }
    else if (num <= 1000000000000) // 100B
    {
        num /= 1000000000;
        return Math.round(num).toLocaleString() + "B";
    }
    else // 1.00T
    {
        num /= 1000000000000;
        return Math.round(num).toLocaleString() + "T";
    }
}

module.exports.help = {
    name: "card",
    description: "Make an osu! profile card",
    usage: "card [<user>]",
    example: "card shdewz",
    category: "osu!"
}