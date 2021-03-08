const config = require("../config.json");
const { CanvasRenderService } = require('chartjs-node-canvas');
const Canvas = require("canvas");
const moment = require("moment");
const axios = require("axios");
const tools = require("../tools.js");

Canvas.registerFont('./fonts/B2-Medium.ttf', { family: 'B2-Medium' });

let api = axios.create({
    baseURL: "https://api.openweathermap.org/data/2.5",
});

module.exports.run = async (message, args) => {
    let query = "";
    if (args.length == 0) {
        let user = statObj.users.find(u => u.discord == message.author.id);
        //query = `${user.location.lat},${user.location.lon}`;
        query = user.location.string;
    }
    else query = args.filter(a => !a.startsWith("-")).join(" ");

    let location_array = await tools.getLocation(query, false /*args.length == 0 ? true : false*/);
    if (location_array.error) return message.reply("place not found.");
    let location = location_array[0];
    let w = await getWeather(location.latitude, location.longitude);

    if (args.includes("-forecast")) {
        let width = 800;
        let height = 500;

        let maincolor = "255, 112, 112"
        let altcolor = "255, 162, 99"
        let bgcolor = "20, 20, 20"
        if (args.includes("-light")) { bgcolor = "230, 230, 230" }

        const crs = new CanvasRenderService(width, height, (ChartJS) => { });
        (async () => {
            var canvas = Canvas.createCanvas(width, height);
            var ctx = canvas.getContext('2d');
            ctx.font = "B2-Medium";

            var gradient = ctx.createLinearGradient(0, height / 10, 0, height);
            gradient.addColorStop(0, `rgba(${maincolor}, 1)`);
            gradient.addColorStop(1, `rgba(${bgcolor}, 0)`);

            var gradient2 = ctx.createLinearGradient(0, height / 10, 0, height);
            gradient2.addColorStop(0, `rgba(${altcolor}, 1)`);
            gradient2.addColorStop(1, `rgba(${bgcolor}, 0)`);

            // make the chart
            let data = {
                labels: w.hourly.map(o => moment.utc(Number(`${o.dt}000`)).add(w.timezone_offset, "s").format("ddd \xa0 HH:mm")),
                datasets: [{
                    label: "Temperature (°C)",
                    backgroundColor: `rgba(${maincolor}, 0.2)`,
                    borderColor: `rgba(${maincolor}, 1)`,
                    pointRadius: 0,
                    data: w.hourly.map(o => o.temp),
                    fill: 'start',
                }, {
                    label: "Feel (°C)",
                    backgroundColor: `rgba(${altcolor}, 0.2)`,
                    borderColor: `rgba(${altcolor}, 1)`,
                    pointRadius: 0,
                    data: w.hourly.map(o => o.feels_like),
                    fill: 'start',
                }]
            }

            const configuration = {
                type: 'line',
                data: data,
                options: {
                    title: {
                        text: `Two day temperatures for ${typeof location.city === "undefined" ? "" : `${location.city}, `}${location.country}`,
                        display: true,
                        fontSize: 24
                    },
                    scales: {
                        yAxes: [{
                            gridLines: {
                                color: `rgba(70, 70, 70, 0.2)`,
                                zeroLineWidth: 1,
                                zeroLineColor: `rgba(100, 100, 100, 0.8)`
                            },
                            ticks: {
                                callback: (value) => `${value}°C`
                            },
                            scaleLabel: {
                                labelString: "Temperature (°C)",
                                fontSize: 16,
                                display: true
                            }
                        }],
                        xAxes: [{
                            gridLines: {
                                color: `rgba(70, 70, 70, 0.1)`,
                            },
                            scaleLabel: {
                                labelString: "Time",
                                fontSize: 16,
                                display: true,
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
            const image = await crs.renderToBuffer(configuration);

            ctx.fillStyle = `rgba(${bgcolor}, 1)`;
            ctx.fillRect(0, 0, width, height);

            var chartimage = await Canvas.loadImage(image);
            ctx.drawImage(chartimage, 0, 0, width, height);

            let buffer = canvas.toBuffer('image/png');

            message.channel.send({ files: [buffer] });
        })();
    }
    else {
        let weatherdata = [
            {
                name: "Current Time",
                value: `${moment.utc().add(w.timezone_offset, "s").format("HH:mm (dddd)")}`
            },
            {
                name: "Temperature",
                value: `${w.current.temp}°C (feels ${w.current.feels_like}°C)`
            },
            {
                name: "Humidity",
                value: `${w.current.humidity}%`
            },
            {
                name: "Clouds",
                value: `${w.current.clouds}%`
            },
            {
                name: "Wind",
                value: `${w.current.wind_speed} m/s ${getDirection(w.current.wind_deg)}`
            }
        ];

        let embed = {
            color: message.member.displayColor == 0 ? 0xFFFFFF : message.member.displayColor,
            author: {
                name: `Weather for ${location.label}`,
                icon_url: location.country_module ? `https://osu.ppy.sh/images/flags/${location.country_module.global.alpha2}.png` : "",
            },
            thumbnail: {
                url: `https://openweathermap.org/img/wn/${w.current.weather[0].icon}@2x.png`,
            },
            title: `${w.current.weather[0].description[0].toUpperCase()}${w.current.weather[0].description.slice(1)}`,
            description: `${weatherdata.map(wd => `**${wd.name}:** ${wd.value}`).join("\n")}`,
        }

        return message.channel.send({ embed: embed });
    }
}

function getDirection(deg) {
    return ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"][(Math.floor((deg / 45) + 0.5) % 8)];
}

async function getWeather(lat, lon) {
    return new Promise(async resolve => {
        api.get("/onecall", { params: { lat: lat, lon: lon, exclude: "minutely,daily", units: "metric", appid: config.keys.weatherapi } })
            .then(async response => {
                response = response.data;
                if (response.length == 0) resolve({ error: `Error fetching weather data for **${query}**.` });
                resolve(response);
            });
    });
}

module.exports.help = {
    name: "weather",
    description: "Weather for a specific country/state/city. Non-english characters are not supported.",
    category: "Api",
    usage: "weather <city> [<state>] [<country code>]",
    example: "weather Hell US"
}