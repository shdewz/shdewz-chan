const config = require("../config.json");
const fetch = require('node-fetch');
const { MessageAttachment } = require('discord.js');
const Canvas = require('canvas');
const tools = require('../tools.js');
const registerFont = require('canvas');

module.exports.run = async (message, args) => {
    try {
        var mode = 0

        Canvas.registerFont('./fonts/B2-Medium.ttf', { family: 'B2-Medium' });
        Canvas.registerFont('./fonts/B2-Bold.ttf', { family: 'B2-Bold' });

        var uid;

        if (args.length < 1) {
            let found;
            for (var i = 0; i < statObj.users.length; i++) {
                if (statObj.users[i].discord == message.author.id) {
                    uid = statObj.users[i].osu_id;
                    found = true;
                    break;
                }
            }
            if (!found) return tools.osu.noAccountAlert(message);
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

        var apikey = config.keys.osu.apikey_old;

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

                let design = args.includes("-d") ? args[args.indexOf("-d") + 1] : 0;

                switch (design) {

                    case 0:
                        var canvas = Canvas.createCanvas(600, 200);
                        var c = canvas.getContext('2d');

                        var bg = await Canvas.loadImage("https://wallpaperaccess.com/full/1761712.jpg");
                        c.drawImage(bg, 0, 0, 600, 200);

                        c.fillStyle = "#FFFFFF";

                        c.shadowColor = "#000000";
                        c.shadowBlur = "8";

                        var uoffset = 0;
                        if (username.length >= 17) { c.font = "25px B2-Medium"; uoffset = -3; }
                        else if (username.length >= 13) { c.font = "30px B2-Medium"; uoffset = -2; }
                        else if (username.lenght >= 11) { c.font = "35px B2-Medium"; uoffset = -1; }
                        else { c.font = "40px B2-Medium"; }

                        c.fillText(username, 140, 45 + uoffset);

                        c.font = "14px B2-Medium";
                        c.fillStyle = "#000000";
                        c.strokeText(`${modetext} stats`, 140, 65);
                        c.strokeText(`Joined ${formatDate(joindate)} (${timeSince(joindate)})`, 140, 85);
                        c.fillStyle = "#FFFFFF";
                        c.fillText(`${modetext} stats`, 140, 65);
                        c.fillText(`Joined ${formatDate(joindate)} (${timeSince(joindate)})`, 140, 85);

                        c.font = "14px B2-Medium";
                        c.fillStyle = "#000000";
                        c.strokeText(`Accuracy:  ${Math.round(accuracy * 100) / 100}%`, 15, 150);
                        c.strokeText(`Playcount:  ${parseInt(playcount).toLocaleString()}`, 15, 170);
                        c.strokeText(`Ranked score:  ${as(score)}`, 15, 190);
                        c.fillStyle = "#FFFFFF";
                        c.fillText(`Accuracy:  ${Math.round(accuracy * 100) / 100}%`, 15, 150);
                        c.fillText(`Playcount:  ${parseInt(playcount).toLocaleString()}`, 15, 170);
                        c.fillText(`Ranked score:  ${as(score)}`, 15, 190);

                        var roffset = 0;
                        if (rank.length >= 6) { c.font = "40px B2-Bold"; roffset = -2; }
                        else if (rank.lenght >= 5) { c.font = "45px B2-Bold"; }
                        else { c.font = "50px B2-Bold"; }

                        c.textAlign = "right";
                        c.fillText(`#${parseInt(rank).toLocaleString()}`, 590, 50 + roffset);

                        c.font = "30px B2-Bold";
                        c.fillText(`#${parseInt(countryrank).toLocaleString()}`, 532, 86);

                        c.font = "20px B2-Medium";
                        c.fillStyle = "#000000";
                        c.strokeText(`${Math.round(pp).toLocaleString()} pp`, 590, 116);
                        c.fillStyle = "#FFFFFF";
                        c.fillText(`${Math.round(pp).toLocaleString()} pp`, 590, 116);

                        c.fillRect(140, 95, 200, 30);

                        c.fillStyle = "#2c54b6";
                        c.fillRect(145, 100, 190 * (level % Math.floor(level)), 20);

                        c.textAlign = "center";
                        c.shadowBlur = "2";
                        c.fillStyle = "#000000";
                        c.strokeText(`Level ${Math.floor(level)}`, 238, 117);
                        c.fillStyle = "#FFFFFF";
                        c.fillText(`Level ${Math.floor(level)}`, 238, 117);
                        c.shadowBlur = "8";

                        c.textAlign = "left";

                        var pfp = await Canvas.loadImage("https://a.ppy.sh/" + userid);
                        c.drawImage(pfp, 15, 15, 110, 110);

                        var flag = await Canvas.loadImage(`https://osu.ppy.sh/images/flags/${country.toUpperCase()}.png`);
                        c.drawImage(flag, 542, 60, 48, 30);
                        break;

                    case 1:
                        var canvas = Canvas.createCanvas(400, 200);
                        var c = canvas.getContext('2d');


                        break;
                }

                const attachment = new MessageAttachment(canvas.toBuffer(), 'statcard.png');
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
function as(value) {
    let newValue = value;
    const suffixes = ["", " thousand", " million", " billion", " trillion"];
    let suffixNum = 0;
    while (newValue >= 1000) {
        newValue /= 1000;
        suffixNum++;
    }

    newValue = newValue.toPrecision(3);

    newValue += suffixes[suffixNum];
    return newValue;
}

module.exports.help = {
    name: "card",
    description: "Make an osu! profile card",
    usage: "card [<user>]",
    example: "card shdewz",
    category: "osu!"
}