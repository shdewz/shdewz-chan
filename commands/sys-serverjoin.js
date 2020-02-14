const Discord = require('discord.js');
const Canvas = require('canvas');

module.exports.run = async (member, channel, server) => {
    try {
        const canvas = Canvas.createCanvas(400, 540);
        const c = canvas.getContext('2d');

        // draw everything

        c.fillStyle = "#FFFFFF";
        c.fillRect(0, 0, 400, 540);

        // randomize the style
        var rng = Math.floor(Math.random() * 2) + 1;

        if (rng == 1) {
            const bg = await Canvas.loadImage("./img/yuzukihug.png");
            c.drawImage(bg, 0, 0, canvas.width, canvas.height);

            c.rotate(10 * Math.PI / 180);

            c.beginPath();
            c.arc(210, 290, 90, 0, Math.PI * 2, true);
            c.closePath();
            c.clip();

            const pfp = await Canvas.loadImage(member.user.displayAvatarURL);
            c.drawImage(pfp, 115, 200, 190, 190);

            c.rotate(-10 * Math.PI / 180);
        }
        else if (rng == 2) {
            const bg = await Canvas.loadImage("./img/yuzukihug2.png");
            c.drawImage(bg, 0, 0, canvas.width, canvas.height);

            c.beginPath();
            c.arc(270, 220, 80, 0, Math.PI * 2, true);
            c.closePath();
            c.clip();

            const pfp = await Canvas.loadImage(member.user.displayAvatarURL);
            c.drawImage(pfp, 190, 140, 160, 160);

        }
        else return console.log("something went wrong. rng = " + rng);

        const attachment = new Discord.Attachment(canvas.toBuffer(), 'welcome.png');
        channel.send(`**Welcome to *${server.name}*, ${member.user}!**`, attachment);
    }
    catch (error) {
        return console.log(error);
    }
};

module.exports.help = {
    name: "serverjoin"
}