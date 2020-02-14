const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports.run = async (message, args) => {
    try {
        if (args.length < 2 || isNaN(args[1])) return;

        if (args[0] == "r") {
            var reqType = "rank";
        }
        else var reqType = "pp";

        var value = args[1];

        if (args.length >= 3 && !isNaN(args[2])) var mode = args[2];
        else var mode = 0;

        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                newrank = this.responseText;
                clearTimeout(dead);

                if (reqType == "pp") return message.channel.send(`${parseInt(value).toLocaleString()}pp → #${parseInt(newrank).toLocaleString()}`);
                else if (reqType == "rank") return message.channel.send(`#${parseInt(value).toLocaleString()} → ${parseInt(newrank).toLocaleString()}pp`);
                else return;
            };
        };

        var dead;

        dead = setTimeout(function () {
            return message.channel.send("dead");
        }, 5000);

        xhttp.open("GET", "https://osudaily.net/data/getPPRank.php?t=" + reqType + "&v=" + Math.round(value) + "&m=" + mode, true);
        xhttp.send();
    }
    catch (error) {
        return console.log(error);
    }
};

module.exports.help = {
    name: "pprank"
}