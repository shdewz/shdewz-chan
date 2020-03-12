const moment = require('moment-timezone');
const countrylist = require("countries-list");
const cityTimezones = require('city-timezones');
const axios = require("axios");
const config = require("../config.json");

module.exports.run = async (message, args, client) => {
    try {
        if (args.length == 0 || args[0].toLowerCase() != "utc") {

            let user = "";
            if (args.length > 0) user = args.join("_");

            var stat = client.commands.get("loadstats").run();
            var exists = false;

            if (user == "") {
                for (var i = 0; i < stat.users.length; i++) {
                    if (stat.users[i].discord == message.author.id) {
                        if (stat.users[i].osu_id) {
                            exists = true;
                            return getTime(stat.users[i].osu_id);
                        }
                        else return message.reply(`you haven't linked your osu! profile yet. Set it with \`${config.prefix}osuset <user>\``);
                    }
                }
                if (!exists) return message.reply(`you haven't linked your osu! profile yet. Set it with \`${config.prefix}osuset <user>\``);
            }
            else return getTime(user);

            function getTime(username) {
                // use timezone based on osu country
                let apikey = config.apikey;
                let api = axios.create({
                    baseURL: 'https://osu.ppy.sh/api',
                });

                api.get('/get_user', { params: { k: apikey, u: username } }).then(response => {
                    response = response.data;

                    if (response.length == 0) return;

                    let userid = response[0].user_id;
                    let found = false;
                    var stat = client.commands.get("loadstats").run(); // load stats

                    for (var i = 0; i < stat.users.length; i++) {
                        if (stat.users[i].osu_id == userid) {
                            if (!stat.users[i].timezone) break;
                            var timeoffset = stat.users[i].timezone;
                            found = true;

                            // do stuff
                            let now = moment.utc();
                            if (timeoffset < 0) now.subtract(timeoffset.match(/[0-9]{1,2}/)[0], "hours");
                            else if (timeoffset > 0) now.add(timeoffset.match(/[0-9]{1,2}/)[0], "hours");

                            var time = now.format("HH:mm");

                            let embed = {
                                color: 0xe84393,
                                author: {
                                    name: `It is currently ${time} for ${response[0].username}`,
                                    icon_url: `https://a.ppy.sh/${response[0].user_id}?${+new Date()}`,
                                    url: `https://osu.ppy.sh/u/${response[0].user_id}`
                                }
                            }
                            return message.channel.send({ embed: embed });
                        }
                    }

                    if (!found) {
                        let country_obj = countrylist.countries[response[0].country.toUpperCase()];
                        let country = country_obj.name;
                        let capital = country_obj.capital;

                        // fix broken capitals
                        if (capital == "Washington D.C.") capital = "New York";
                        if (capital == "City of Victoria") capital = "Hong Kong";

                        if (!cityTimezones.lookupViaCity(capital)) return;
                        let city_obj = cityTimezones.lookupViaCity(capital)
                        let timezone = city_obj[0].timezone;
                        if (capital == "London") timezone = "Europe/London";
                        let now = moment().tz(timezone);

                        var time = now.format("HH:mm");
                        //var date = now.format("dddd, MMMM Do, YYYY");

                        let embed = {
                            color: 0xe84393,
                            author: {
                                name: `It is currently ${time} for ${response[0].username}`,
                                icon_url: `https://a.ppy.sh/${response[0].user_id}?${+new Date()}`,
                                url: `https://osu.ppy.sh/u/${response[0].user_id}`
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
                color: 0xe84393,
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