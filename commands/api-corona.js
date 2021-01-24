const axios = require("axios");
const { CanvasRenderService } = require('chartjs-node-canvas');
const Canvas = require("canvas");
const moment = require("moment");
const { MessageAttachment } = require('discord.js')

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

const api = axios.create({
    baseURL: 'https://corona.lmao.ninja/v2',
});

const apiv2 = axios.create({
    baseURL: 'https://api.covid19api.com',
});

const apiCountry = axios.create({
    baseURL: 'https://restcountries.eu/rest/v2',
});

module.exports.run = async (message, args, client) => {
    try {
        if (args.includes("-v2")) {
            args.splice(args.indexOf("-v2"), 1);
            if (args.length == 0) {
                apiv2.get("/summary").then(response => {
                    data = response.data.Global;
                    let embed = {
                        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                        author: {
                            name: `Coronavirus overall statistics:`
                        },
                        fields: [
                            {
                                name: "Cases", value: `**${data.TotalConfirmed.toLocaleString()}** *(+${data.NewConfirmed.toLocaleString()})*
                                ▸ *${((data.TotalConfirmed / 7773486625) * 100).toFixed(4).toLocaleString()}% of everyone*
                                ▸ *1 in every ${Math.round(1 / (data.TotalConfirmed / 7773486625)).toLocaleString()}*`
                            },
                            {
                                name: "Deaths", value: `**${data.TotalDeaths.toLocaleString()}** *(+${data.NewDeaths.toLocaleString()})*
                                ▸ *${((data.TotalDeaths / data.TotalConfirmed) * 100).toFixed(2).toLocaleString()}% of cases*`
                            },
                            {
                                name: "Recoveries", value: `**${data.TotalRecovered.toLocaleString()}** *(+${data.NewRecovered.toLocaleString()})*
                                ▸ *${((data.TotalRecovered / data.TotalConfirmed) * 100).toFixed(2).toLocaleString()}% of cases*`
                            }
                        ]
                    }
                    return message.channel.send({ embed: embed });
                });
            }
            else {
                if (args.filter(a => !a.startsWith("-")).length > 0) {
                    let query = args.filter(a => !a.startsWith("-")).join(" ").toLowerCase();
                    let countries = await getCountries();
                    let country = countries.find(c => c.Country.toLowerCase() == query || c.Slug.toLowerCase() == query.replace(/ /g, "-") || c.ISO2.toLowerCase() == query);
                    if (!country) return message.reply(`country **${query}** not found.`);

                    let data = await getCountryData(country.Slug);
                    let info = data[data.length - 1];
                    let prev = data[data.length - 2];
                    let population = await getPopulation(info.CountryCode);
                    let chart = await drawChart(data);

                    const chartimage = new MessageAttachment(chart, `covid19-${info.Country.replace(/ /g, "_").toLowerCase()}-chart.png`);

                    let embed = {
                        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                        author: {
                            name: `Coronavirus in ${info.Country}`,
                            icon_url: `https://osu.ppy.sh/images/flags/${info.CountryCode}.png`
                        },
                        fields: [
                            {
                                name: "Cases", value: `**${info.Confirmed.toLocaleString()}** *(+${(info.Confirmed - prev.Confirmed).toLocaleString()})*
                                ▸ *${((info.Confirmed / population) * 100).toFixed(4).toLocaleString()}% of country*
                                ▸ *1 in every ${Math.round(1 / (info.Confirmed / population)).toLocaleString()}*`
                            },
                            {
                                name: "Deaths", value: `**${info.Deaths.toLocaleString()}** *(+${(info.Deaths - prev.Deaths).toLocaleString()})*
                                ▸ *${((info.Deaths / info.Confirmed) * 100).toFixed(2).toLocaleString()}% of cases*`
                            },
                            {
                                name: "Recoveries", value: `**${info.Recovered.toLocaleString()}** *(+${(info.Recovered - prev.Recovered).toLocaleString()})*
                                ▸ *${((info.Deaths / info.Confirmed) * 100).toFixed(2).toLocaleString()}% of cases*`
                            }
                        ],
                        image: {
                            url: `attachment://covid19-${info.Country.replace(/ /g, "_").toLowerCase()}-chart.png`,
                        },
                    }
                    return message.channel.send({ files: [chartimage], embed: embed });
                }
            }
        }
        else {
            if (args.length == 0) {
                api.get("/all").then(response => {
                    data = response.data;
                    let embed = {
                        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
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
                        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
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

                    let sort = args.includes("-today") ? "todayCases" : "cases";
                    data.sort(GetSortOrder(sort)).reverse();

                    let result = [];
                    data.slice(0, 10).forEach((d, i) => {
                        result.push({
                            rank: `**#${i + 1}**`,
                            country: `:flag_${d.countryInfo.iso2.toLowerCase()}: **${d.country}**`,
                            value: `${args.includes("-today") ? d.todayCases.toLocaleString() : d.cases.toLocaleString()}`
                        })
                    });

                    let embed = {
                        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                        author: {
                            name: `Top 10 by cases${args.includes("-today") ? " (today)" : ""}:`
                        },
                        fields: [
                            {
                                name: "\u200b", value: result.map(r => r.rank).join("\n"), inline: true
                            },
                            {
                                name: "Country", value: result.map(r => r.country).join("\n"), inline: true
                            },
                            {
                                name: "Cases", value: result.map(r => r.value).join("\n"), inline: true
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
                    data.sort(GetSortOrder("deaths")).reverse();

                    let result = [];
                    data.slice(0, 10).forEach((d, i) => {
                        result.push({
                            rank: `**#${i + 1}**`,
                            country: `:flag_${d.countryInfo.iso2.toLowerCase()}: **${d.country}**`,
                            value: `${d.deaths.toLocaleString()}`
                        })
                    });

                    let embed = {
                        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                        author: {
                            name: `Top 10 by deaths:`
                        },
                        fields: [
                            {
                                name: "\u200b", value: result.map(r => r.rank).join("\n"), inline: true
                            },
                            {
                                name: "Country", value: result.map(r => r.country).join("\n"), inline: true
                            },
                            {
                                name: "Deaths", value: result.map(r => r.value).join("\n"), inline: true
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
                    let newData = [];

                    let populationCheck = new Promise((resolve, reject) => {
                        data.forEach(async (d, index, array) => {
                            if (!d.countryInfo.iso2 || d.countryInfo.iso2 == null) return;
                            else {
                                await apiCountry.get("/alpha/" + d.countryInfo.iso2).then(c => {
                                    d.percent = d.cases / c.data.population;
                                    newData.push(d);
                                });
                            }
                            if (index === array.length - 1) resolve();
                        });
                    });

                    populationCheck.then(() => {
                        newData.sort(GetSortOrder("percent"));
                        if (!args.includes("-reverse")) newData.reverse();

                        let result = [];
                        newData.slice(0, 10).forEach((d, i) => {
                            result.push({
                                rank: `**#${i + 1}**`,
                                country: `${d.countryInfo.iso2 == null ? "--" : `:flag_${d.countryInfo.iso2.toLowerCase()}:`} **${d.country}**`,
                                value: `${(d.percent * 100).toFixed(4)}%`
                            })
                        });

                        let embed = {
                            color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                            author: {
                                name: `Top 10 by % infected:`
                            },
                            fields: [
                                {
                                    name: "\u200b", value: result.map(r => r.rank).join("\n"), inline: true
                                },
                                {
                                    name: "Country", value: result.map(r => r.country).join("\n"), inline: true
                                },
                                {
                                    name: "Cases", value: result.map(r => r.value).join("\n"), inline: true
                                }
                            ]
                        }
                        return message.channel.send({ embed: embed });
                    });

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
                        color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
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
                                color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
                                author: {
                                    name: `Coronavirus in ${data.country}:`,
                                    icon_url: `https://osu.ppy.sh/images/flags/${code}.png`
                                },
                                fields: [
                                    {
                                        name: "Cases", value: `**${data.cases.toLocaleString()}** *(+${data.todayCases.toLocaleString()})*
                                        ▸ *${((data.cases / countries.population) * 100).toFixed(4).toLocaleString()}% of country*
                                        ▸ *1 in every ${Math.round(1 / (data.cases / countries.population)).toLocaleString()}*`,
                                        inline: true
                                    },
                                    {
                                        name: "Deaths", value: `**${data.deaths.toLocaleString()}** *(+${data.todayDeaths.toLocaleString()})*
                                        ▸ *${((data.deaths / data.cases) * 100).toFixed(2).toLocaleString()}% of cases*`,
                                        inline: true
                                    },
                                    {
                                        name: "Recovered", value: `**${data.recovered.toLocaleString()}**
                                        ▸ *${((data.recovered / data.cases) * 100).toFixed(2).toLocaleString()}% of cases*`,
                                        inline: true
                                    },
                                    {
                                        name: "Tests", value: `**${data.tests.toLocaleString()}**
                                        ▸ *${((data.tests / countries.population) * 100).toFixed(2).toLocaleString()}% of country*
                                        ▸ *1 in every ${Math.round(1 / (data.tests / countries.population)).toLocaleString()}*`,
                                        inline: true
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
                                color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
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
    }
    catch (err) {
        message.channel.send("error fetching data");
        return console.error(err);
    }
};

async function getCountries() {
    return new Promise(resolve => { apiv2.get("/countries").then(response => { resolve(response.data); }); });
}

async function getCountryData(country) {
    return new Promise(resolve => { apiv2.get(`/dayone/country/${country}`).then(response => { resolve(response.data); }); });
}

async function getPopulation(country) {
    return new Promise(resolve => { apiCountry.get(`/alpha/${country}`).then(response => { resolve(response.data.population); }); });
}

async function drawChart(d) {
    return new Promise(async resolve => {
        let width = 800;
        let height = 300;
        let canvas = Canvas.createCanvas(width, height);
        let ctx = canvas.getContext('2d');
        let maincl = "0, 130, 250";
        let altcl = "250, 0, 80";
        let textcl = "150, 150, 150";
        let bgcolor = "20, 20, 20";
        let bgalt = "30, 30, 30";

        const crs = new CanvasRenderService(width, height, (ChartJS) => { });
        (async () => {
            let data = {
                labels: d.map(d => d.Date),
                datasets: [{
                    label: "Cases",
                    backgroundColor: `rgba(${maincl}, 0.1)`,
                    borderColor: `rgba(${maincl}, 1)`,
                    pointRadius: 0,
                    yAxisID: 'A',
                    data: d.map(d => d.Confirmed),
                    fill: 'start',
                }, {
                    label: "Deaths",
                    backgroundColor: `rgba(${altcl}, 0.1)`,
                    borderColor: `rgba(${altcl}, 1)`,
                    pointRadius: 0,
                    yAxisID: 'B',
                    data: d.map(d => d.Deaths),
                    fill: 'start',
                }]
            }

            const configuration = {
                type: 'line',
                data: data,
                options: {
                    title: {
                        text: `Coronavirus in ${d[0].Country}`,
                        display: true,
                        fontSize: 24
                    },
                    scales: {
                        yAxes: [
                            {
                                id: 'A',
                                position: 'left',
                                gridLines: {
                                    color: `rgba(70, 70, 70, 0.2)`,
                                    zeroLineWidth: 1,
                                    zeroLineColor: `rgba(100, 100, 100, 0.8)`
                                },
                                scaleLabel: {
                                    labelString: "Cases",
                                    fontSize: 16,
                                    display: true
                                }
                            },
                            {
                                id: 'B',
                                position: 'right',
                                scaleLabel: {
                                    labelString: "Deaths",
                                    fontSize: 16,
                                    display: true
                                }
                            }
                        ],
                        xAxes: [{
                            type: "time",
                            gridLines: {
                                color: `rgba(70, 70, 70, 0.1)`,
                            },
                            scaleLabel: {
                                labelString: "Date",
                                fontSize: 16,
                                display: false,
                            },
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 16
                            }
                        }]
                    },
                    layout: {
                        padding: {
                            left: 10,
                            right: 5,
                            top: 10,
                            bottom: 10
                        }
                    }
                }
            };
            let image = await crs.renderToBuffer(configuration);

            ctx.fillStyle = `rgba(${bgcolor}, 1)`;
            ctx.fillRect(0, 0, width, height);
            var chartimage = await Canvas.loadImage(image);
            ctx.drawImage(chartimage, 0, 0);
            let buffer = canvas.toBuffer('image/png');
            resolve(buffer);
        })();
    });
}

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