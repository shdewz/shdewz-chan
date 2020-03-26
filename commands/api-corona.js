const axios = require("axios");
const covid = require("novelcovid");
const moment = require("moment");

const corrections = {
    "KR": "S. Korea",
    "GB": "UK",
    "IR": "Iran",
    "US": "USA",
    "IN": "India",
    "RU": "Russia",
    "FO": "Faeroe Islands",
    "VA": "Vatican City"
}


const queryCorrections = {
    "UK": "GB"
}

module.exports.run = async (message, args) => {
    try {
        const api = axios.create({
            baseURL: 'https://corona.lmao.ninja',
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
                            name: "Cases", value: `**${data.cases.toLocaleString()}**
                            ▸ *${((data.cases /  7773486625) * 100).toFixed(4).toLocaleString()}% of everyone*
                            ▸ *= ${Math.round((data.cases /  7773486625) * 1000000).toLocaleString()} out of 1 million*`
                        },
                        {
                            name: "Deaths", value: `**${data.deaths.toLocaleString()}**
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
        else {
            const apiCountry = axios.create({
                baseURL: 'https://restcountries.eu/rest/v2',
            });

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
                                    ▸ *= ${Math.round((data.cases / countries.population) * 100 * 1000000).toLocaleString()} out of 1 million*`
                                },
                                {
                                    name: "Deaths", value: `**${data.deaths.toLocaleString()}** *(+${data.todayDeaths.toLocaleString()})*
                                    ▸ *${((data.deaths / data.cases) * 100).toFixed(2).toLocaleString()}% of cases*`
                                },
                                {
                                    name: "Recovered", value: `**${data.recovered.toLocaleString()}**
                                    ▸ *${((data.recovered / data.cases) * 100).toFixed(2).toLocaleString()}% of cases*`
                                }
                            ]
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
                                    ▸ *= ${Math.round((data.cases / countries.population) * 1000000).toLocaleString()} out of 1 million*`
                                },
                                {
                                    name: "Deaths", value: `**${data.deaths.toLocaleString()}** *(+${data.todayDeaths.toLocaleString()})*
                                    ▸ *${((data.deaths / data.cases) * 100).toFixed(2)}% of cases*`
                                },
                                {
                                    name: "Recovered", value: `**${data.recovered.toLocaleString()}**
                                    ▸ *${((data.recovered / data.cases) * 100).toFixed(2)}% of cases*`
                                }
                            ]
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
    return function(a, b) {  
        if (a[prop] > b[prop]) {  
            return 1;  
        } else if (a[prop] < b[prop]) {  
            return -1;  
        }  
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