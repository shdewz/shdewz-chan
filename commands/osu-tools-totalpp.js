const config = require("../config.json");
const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports.run = async (message, args) => {
    try {
        var uid;

        if (args.length == 0) {
            let found;
            for (var i = 0; i < statObj.users.length; i++) {
                if (statObj.users[i].discord == message.author.id) {
                    uid = statObj.users[i].osu_id;
                    found = true;
                    break;
                }
            }
            if (!found) return message.channel.send(`Looks like you haven't linked your account yet.\nLink it with the command \`${config.prefix}osuset <user>\`.`)
        }

        else uid = args.join('_');

        // get osu stats
        const osuStatRequest = async () => {
            const response = await fetch(`https://osu.ppy.sh/api/get_user?k=${config.keys.osu.apikey_old}&m=0&u=${uid}`);
            const osujson = await response.json();

            var osupp = osujson[0].pp_raw;
            var userid = osujson[0].user_id;
            var country = osujson[0].country;
            var username = osujson[0].username;

            // get taiko stats
            const taikoStatRequest = async () => {
                const response = await fetch(`https://osu.ppy.sh/api/get_user?k=${config.keys.osu.apikey_old}&m=1&u=${uid}`);
                const taikojson = await response.json();

                var taikopp = taikojson[0].pp_raw;

                // get ctb stats
                const ctbStatRequest = async () => {
                    const response = await fetch(`https://osu.ppy.sh/api/get_user?k=${config.keys.osu.apikey_old}&m=2&u=${uid}`);
                    const ctbjson = await response.json();

                    var ctbpp = ctbjson[0].pp_raw;

                    // get mania stats
                    const maniaStatRequest = async () => {
                        const response = await fetch(`https://osu.ppy.sh/api/get_user?k=${config.keys.osu.apikey_old}&m=3&u=${uid}`);
                        const maniajson = await response.json();

                        var maniapp = maniajson[0].pp_raw;

                        // get profile picture and flag
                        var avatarurl = `https://a.ppy.sh/${userid}?${+new Date()}`;
                        var flagurl = `https://osu.ppy.sh/images/flags/${country.toUpperCase()}.png`;

                        var totalpp = parseInt(osupp) + parseInt(taikopp) + parseInt(ctbpp) + parseInt(maniapp);

                        // display stuff
                        const statEmbed = new Discord.RichEmbed()
                            .setAuthor(username, flagurl, url = `https://osu.ppy.sh/u/${userid}`)
                            .setColor('#ff007a')
                            .setThumbnail(avatarurl)
                            .setDescription(`*⯈ osu:*  **${parseInt(osupp).toLocaleString()}pp**\n*⯈ taiko:*  **${parseInt(taikopp).toLocaleString()}pp**\n*⯈ catch:*  **${parseInt(ctbpp).toLocaleString()}pp**\n*⯈ mania:*  **${parseInt(maniapp).toLocaleString()}pp**\n\n*⯈ total:* **${parseInt(totalpp).toLocaleString()}pp**`)
                        message.channel.send(statEmbed);
                    }
                    maniaStatRequest();
                }
                ctbStatRequest();
            }
            taikoStatRequest();
        }
        return osuStatRequest();
    }
    catch (error) {
        console.log(error);
        return message.channel.send(`Something happened!\n\`\`\`\n${error}\n\`\`\``); // send error as message
    }
};

module.exports.help = {
    name: "totalpp",
    description: "Calculate the total pp across all gamemodes for the selected user",
    usage: "totalpp [<user>]",
    example: "totalpp shdewz",
    category: "osu!"
}