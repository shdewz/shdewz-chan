const axios = require("axios");

module.exports.run = async (message, args) => {
    try {
        const api = axios.create({
            baseURL: 'https://coronavirus-19-api.herokuapp.com',
        });

        if (args.length == 0) {
            api.get("/all").then(response => {
                response = response.data;
                let embed = {
                    color: message.member.displayColor,
                    author: {
                        name: `Coronavirus statistics:`
                    },
                    fields: [
                        {
                            name: "Cases", value: `**${response.cases.toLocaleString()}**`
                        },
                        {
                            name: "Deaths", value: `**${response.deaths.toLocaleString()}**`
                        },
                        {
                            name: "Recovered", value: `**${response.recovered.toLocaleString()}**`
                        }
                    ]
                }
                return message.channel.send({ embed: embed });
            }).catch(err => {
                message.channel.send("error fetching data");
                return console.error(err);
            });
        }
        else {
            let country = args.join(" ");
            api.get("/countries/" + country).then(response => {
                response = response.data;
                country = response.country;

                const apiCountry = axios.create({
                    baseURL: 'https://restcountries.eu/rest/v2/name/',
                });

                apiCountry.get(country).then(countries => {
                    countries = countries.data;
                    let countryCode = countries[0].alpha2Code;
                    let embed = {
                        color: message.member.displayColor,
                        author: {
                            name: `Coronavirus in ${response.country}:`,
                            icon_url: `https://osu.ppy.sh/images/flags/${countryCode}.png`,
                        },
                        fields: [
                            {
                                name: "Cases", value: `**${response.cases.toLocaleString()}** *(+${response.todayCases.toLocaleString()})*`
                            },
                            {
                                name: "Deaths", value: `**${response.deaths.toLocaleString()}** *(+${response.todayDeaths.toLocaleString()})*`
                            },
                            {
                                name: "Recovered", value: `**${response.recovered.toLocaleString()}**`
                            }
                        ]
                    }
                    return message.channel.send({ embed: embed });
                });
            }).catch(err => {
                message.channel.send("error fetching data");
                return console.error(err);
            });
        }


    }
    catch (err) {
        message.channel.send("error fetching data");
        return console.error(err);
    }
};

module.exports.help = {
    name: "corona",
    aliases: ["coronavirus", "covid-19"],
    description: "Data about this thing that will kill us all.",
    usage: "corona [<country>]",
    example: "corona FI",
    category: "Api"
}