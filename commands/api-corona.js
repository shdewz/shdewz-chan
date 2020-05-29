const axios = require("axios");
const moment = require("moment");

const corrections = {
    "KR": "S. Korea",
    "GB": "UK",
    "IR": "Iran",
    "US": "USA",
    "IN": "India",
    "RU": "Russia",
    "FO": "Faeroe Islands",
    "VA": "Vatican City",
    "SS": "Sudan",
    "SX": "Sint Maarten"
}


const queryCorrections = {
    "UK": "GB"
}

module.exports.run = async (message, args) => {
    try {
        const api = axios.create({
            baseURL: 'https://corona.lmao.ninja/v2',
        });

        const apiCountry = axios.create({
            baseURL: 'https://restcountries.eu/rest/v2',
        });

        if (args.length == 0) {
            api.get("/all").then(response => {
                data = response.data;
                let embed = {
                    color: message.member.displayColor,
                    author: {
                        name: `Coronavirus overall statistics:`
                    },
                    fields: [
                        {
                            name: "Cases", value: `**${data.cases.toLocaleString()}** *(+${data.todayCases.toLocaleString()})*
                            ▸ *${((data.cases / 7773486625) * 100).toFixed(4).toLocaleString()}% of everyone*
                            ▸ *1 in every ${Math.round(1 / (data.cases / 7773486625)).toLocaleString()}*`
                        },
                        {
                            name: "Deaths", value: `**${data.deaths.toLocaleString()}** *(+${data.todayDeaths.toLocaleString()})*
                            ▸ *${((data.deaths / data.cases) * 100).toFixed(2).toLocaleString()}% of cases*
                            ▸ *${((data.deaths / 50000000) * 100).toFixed(2).toLocaleString()}% of the Spanish flu*`
                        },
                        {
                            name: "Recovered", value: `**${data.recovered.toLocaleString()}**
                            ▸ *${((data.recovered / data.cases) * 100).toFixed(2).toLocaleString()}% of cases*`
                        }
                    ],
                    footer: {
                        text: `Updated ${moment.utc(data.updated).fromNow()}`
                    }
                }
                return message.channel.send({ embed: embed });
            }).catch(err => {
                return console.log(err);
            });
        }
        else if (args[0].toLowerCase() == "-countries") {
            api.get("/countries").then(response => {
                data = response.data;

                let countries = [];
                for (var i = 0; i < data.length; i++) {
                    countries.push(data[i].country);
                }

                countries.sort();

                let embed = {
                    color: message.member.displayColor,
                    author: {
                        name: `All supported countries:`
                    },
                    description: `${countries.join(", ")}`
                }
                return message.channel.send({ embed: embed });
            }).catch(err => {
                return console.log(err);
            });
        }
        else if (args[0].toLowerCase() == "-top10cases") {
            api.get("/countries").then(response => {
                data = response.data;

                data.sort(GetSortOrder("cases"));
                data.reverse();

                let countryText = "";
                let valueText = "";
                for (var i = 0; i < 10; i++) {
                    countryText += `**#${i + 1} ${data[i].country}**\n`
                    valueText += `${data[i].cases.toLocaleString()}\n`
                }

                let embed = {
                    color: message.member.displayColor,
                    author: {
                        name: `Top 10 by cases:`
                    },
                    fields: [
                        {
                            name: "Country", value: countryText, inline: true
                        },
                        {
                            name: "Cases", value: valueText, inline: true
                        }
                    ]
                }
                return message.channel.send({ embed: embed });
            }).catch(err => {
                return console.log(err);
            });
        }
        else if (args[0].toLowerCase() == "-top10deaths") {
            api.get("/countries").then(response => {
                data = response.data;

                data.sort(GetSortOrder("deaths"));
                data.reverse();

                let countryText = "";
                let valueText = "";
                for (var i = 0; i < 10; i++) {
                    countryText += `**#${i + 1} ${data[i].country}**\n`
                    valueText += `${data[i].deaths.toLocaleString()}\n`
                }

                let embed = {
                    color: message.member.displayColor,
                    author: {
                        name: `Top 10 by deaths:`
                    },
                    fields: [
                        {
                            name: "Country", value: countryText, inline: true
                        },
                        {
                            name: "Deaths", value: valueText, inline: true
                        }
                    ]
                }
                return message.channel.send({ embed: embed });
            }).catch(err => {
                return console.log(err);
            });
        }
        else if (args[0].toLowerCase() == "-top10cases%") {
            api.get("/countries").then(async response => {
                var data = response.data;
                message.channel.send("Calculating, will take a while.");

                for (var i = 0; i < data.length; i++) {
                    if (!data[i].countryInfo.iso2 || data[i].countryInfo.iso2 == null) {
                        data[i].percent = 0;
                        continue;
                    }
                    await apiCountry.get("/alpha/" + data[i].countryInfo.iso2).then(countries => {
                        var population = countries.data.population;
                        data[i].percent = data[i].cases / population;
                        console.log(`${i + 1} / ${data.length}`);
                    });
                }

                data.sort(GetSortOrder("percent"));
                if (args[1] != "-reverse") data.reverse();

                let countryText = "";
                let valueText = "";
                for (var i = 0; i < 10; i++) {
                    countryText += `**#${i + 1} ${data[i].country}**\n`
                    valueText += `${(data[i].percent * 100).toFixed(4).toLocaleString()}%\n`
                }

                let embed = {
                    color: message.member.displayColor,
                    author: {
                        name: `Top 10 by % infected:`
                    },
                    fields: [
                        {
                            name: "Country", value: countryText, inline: true
                        },
                        {
                            name: "Cases", value: valueText, inline: true
                        }
                    ]
                }
                return message.channel.send({ embed: embed });
            }).catch(err => {
                return console.log(err);
            });
        }
        else if (args[0].toLowerCase() == "-top10deaths%") {
            var removeLow = 0;
            if (args.includes("-ignorelowvalues")) removeLow = args[args.indexOf("-ignorelowvalues") + 1];
            api.get("/countries").then(async response => {
                var data = response.data;

                for (var i = 0; i < data.length; i++) {
                    if (data[i].deaths == 0 || (removeLow != 0 && data[i].cases < removeLow)) {
                        data.splice(i, 1);
                        i--;
                    }
                    else data[i].percent = data[i].deaths / data[i].cases;
                }

                data.sort(GetSortOrder("percent"));
                if (!args.includes("-reverse")) data.reverse();

                let countryText = "";
                let valueText = "";
                for (var i = 0; i < 10; i++) {
                    countryText += `**#${i + 1} ${data[i].country}**\n`
                    valueText += `${(data[i].percent * 100).toFixed(2).toLocaleString()}%\n`
                }

                let embed = {
                    color: message.member.displayColor,
                    author: {
                        name: `Top 10 by death %:`
                    },
                    fields: [
                        {
                            name: "Country", value: countryText, inline: true
                        },
                        {
                            name: "Deaths", value: valueText, inline: true
                        }
                    ]
                }
                return message.channel.send({ embed: embed });
            }).catch(err => {
                return console.log(err);
            });
        }
        else {
            if (args.length == 1 && args[0].length == 2) {
                // search by code
                let query = args[0].toUpperCase();
                if (Object.keys(queryCorrections).includes(query)) query = queryCorrections[query];

                apiCountry.get("/alpha/" + query).then(countries => {
                    countries = countries.data;

                    let country = countries.name;
                    let code = countries.alpha2Code;
                    if (Object.keys(corrections).includes(code)) country = corrections[code];

                    api.get("/countries/" + country).then(response => {
                        data = response.data;

                        let embed = {
                            color: message.member.displayColor,
                            author: {
                                name: `Coronavirus in ${data.country}:`,
                                icon_url: `https://osu.ppy.sh/images/flags/${code}.png`
                            },
                            fields: [
                                {
                                    name: "Cases", value: `**${data.cases.toLocaleString()}** *(+${data.todayCases.toLocaleString()})*
                                    ▸ *${((data.cases / countries.population) * 100).toFixed(4).toLocaleString()}% of country*
                                    ▸ *1 in every ${Math.round(1 / (data.cases / countries.population)).toLocaleString()}*`
                                },
                                {
                                    name: "Deaths", value: `**${data.deaths.toLocaleString()}** *(+${data.todayDeaths.toLocaleString()})*
                                    ▸ *${((data.deaths / data.cases) * 100).toFixed(2).toLocaleString()}% of cases*`
                                },
                                {
                                    name: "Recovered", value: `**${data.recovered.toLocaleString()}**
                                    ▸ *${((data.recovered / data.cases) * 100).toFixed(2).toLocaleString()}% of cases*`
                                }
                            ],
                            footer: {
                                text: `Updated ${moment.utc(data.updated).fromNow()}`
                            }
                        }
                        return message.channel.send({ embed: embed });
                    }).catch(err => {
                        return console.log(err);
                    });
                }).catch(err => {
                    return console.log(err);
                });
            }
            else {
                // search by name
                let query = args.join(" ");
                apiCountry.get("/name/" + query).then(countries => {
                    countries = countries.data[0];

                    let country = countries.name;
                    let code = countries.alpha2Code;
                    if (Object.keys(corrections).includes(code)) country = corrections[code];

                    api.get("/countries/" + country).then(response => {
                        data = response.data;

                        let embed = {
                            color: message.member.displayColor,
                            author: {
                                name: `Coronavirus in ${data.country}:`,
                                icon_url: `https://osu.ppy.sh/images/flags/${code}.png`
                            },
                            fields: [
                                {
                                    name: "Cases", value: `**${data.cases.toLocaleString()}** *(+${data.todayCases.toLocaleString()})*
                                    ▸ *${((data.cases / countries.population) * 100).toFixed(4)}% of country*
                                    ▸ *1 in every ${Math.round(1 / (data.cases / countries.population)).toLocaleString()}*`
                                },
                                {
                                    name: "Deaths", value: `**${data.deaths.toLocaleString()}** *(+${data.todayDeaths.toLocaleString()})*
                                    ▸ *${((data.deaths / data.cases) * 100).toFixed(2)}% of cases*`
                                },
                                {
                                    name: "Recovered", value: `**${data.recovered.toLocaleString()}**
                                    ▸ *${((data.recovered / data.cases) * 100).toFixed(2)}% of cases*`
                                }
                            ],
                            footer: {
                                text: `Updated ${moment.utc(data.updated).fromNow()}`
                            }
                        }
                        return message.channel.send({ embed: embed });
                    }).catch(err => {
                        return console.log(err);
                    });
                }).catch(err => {
                    return console.log(err);
                });
            }
        }
    }
    catch (err) {
        message.channel.send("error fetching data");
        return console.error(err);
    }
};

function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) return 1;
        else if (a[prop] < b[prop]) return -1;
        return 0;
    }
}

module.exports.help = {
    name: "corona",
    aliases: ["coronavirus", "covid-19"],
    description: "Data about this thing that will kill us all.",
    usage: "corona [<country>]",
    example: "corona FI",
    category: "Api"
}