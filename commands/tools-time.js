const moment = require('moment-timezone');
const tools = require("../tools.js");
const axios = require("axios");
const config = require("../config.json");
const countries = require("countries-list").countries;

module.exports.run = async (message, args) => {
    try {
        if (args.length == 0 || args[0].toLowerCase() != "utc") {

            let user = "";
            if (args.length > 0) user = args.join("_");

            var exists = false;

            if (user == "") {
                for (var i = 0; i < statObj.users.length; i++) {
                    if (statObj.users[i].discord == message.author.id) {
                        if (statObj.users[i].osu_id) {
                            exists = true;
                            return getTime(statObj.users[i].osu_id);
                        }
                        else return message.reply(`you haven't linked your osu! profile yet. Set it with \`${config.prefix}osuset <user>\``);
                    }
                }
                if (!exists) return message.reply(`you haven't linked your osu! profile yet. Set it with \`${config.prefix}osuset <user>\``);
            }
            else return getTime(user);

            function getTime(username) {
                // use timezone based on osu country
                let apikey = config.keys.osu.apikey_old;
                let api = axios.create({
                    baseURL: 'https://osu.ppy.sh/api',
                });

                api.get('/get_user', { params: { k: apikey, u: username } }).then(async response => {
                    response = response.data;

                    if (response.length == 0) return;

                    let userid = response[0].user_id;
                    let found = false;

                    for (var i = 0; i < statObj.users.length; i++) {
                        if (statObj.users[i].osu_id == userid) {
                            if (!statObj.users[i].timezone) break;

                            found = true;

                            let time = moment.utc().add(Number(statObj.users[i].timezone), "hours").format("HH:mm");

                            let embed = {
                                color: message.member.displayColor,
                                author: {
                                    name: `It is currently ${time} for ${response[0].username}`,
                                    icon_url: `https://a.ppy.sh/${response[0].user_id}?${+new Date()}`,
                                    url: `https://osu.ppy.sh/u/${response[0].user_id}`
                                },
                                footer: {
                                    text: `Timezone: UTC${statObj.users[i].timezone}`
                                }
                            }
                            return message.channel.send({ embed: embed });
                        }
                    }

                    if (!found) {
                        let capital = countries[response[0].country].capital;
                        let location_array = await tools.getLocation({ city: capital, country: response[0].country });
                        let location = location_array[0];
                        let timezone = await tools.getTimezone(location.latitude, location.longitude);

                        let time = moment.utc().add(timezone.gmtOffset, "s").format("HH:mm");

                        let embed = {
                            color: message.member.displayColor,
                            author: {
                                name: `It is currently ${time} for ${response[0].username}`,
                                icon_url: `https://a.ppy.sh/${response[0].user_id}?${+new Date()}`,
                                url: `https://osu.ppy.sh/u/${response[0].user_id}`
                            },
                            footer: {
                                text: `Timezone: ${timezone.abbreviation} - ${timezone.zoneName}`
                            }
                        }
                        return message.channel.send({ embed: embed });
                    }
                });
            }
            return;
        }
        else {
            // utc time
            var now = moment.utc(new Date());

            var time = now.format("HH:mm:ss");
            var date = now.format("dddd, MMMM Do, YYYY");

            var detailed = now.format("DDDo [day of the year / Week] w");

            let embed = {
                color: message.member.displayColor,
                description: `**${time} UTC**
                    ${date}
                    ${detailed}`
            }
            return message.channel.send({ embed: embed });
        }
    }
    catch (err) {
        return console.log(err);
    }

};

module.exports.help = {
    name: "time",
    description: "Displays current time in UTC or the specified user's time. Displays your time if no arguments are given.",
    usage: "time [<utc/username>]",
    example: "time Yeong_Yuseong",
    category: "Tools"
}