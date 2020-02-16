const config = require("../config.json");
const fetch = require("node-fetch");

module.exports.run = async (message, args, client) => {
    if (args.length == 0) return message.reply(`correct usage: \`${config.prefix}weather [city] [<state>] [<country code>]\``);
    var query = args.join(",");
    const apikey = config.weatherapi;
    const baseurl = "https://api.openweathermap.org/data/2.5";

    const apiCall = async () => {
        try {
            const response = await fetch(`${baseurl}/weather?q=${query}&appid=${apikey}&units=metric`);
            const result = await response.json();

            var temp = result.main.temp;
            var feeltemp = result.main.feels_like;
            var mintemp = result.main.temp_min;
            var maxtemp = result.main.temp_max;
            var pressure = result.main.pressure;
            var humidity = result.main.humidity;

            var windspeed = result.wind.speed;
            var winddeg = result.wind.deg;

            var clouds = result.clouds.all;

            var city = result.name;
            var country = result.sys.country;

            let embed = {
                color: 0xe84393,
                author: {
                    name: `Weather for ${city}, ${country}`,
                    icon_url: `https://osu.ppy.sh/images/flags/${country}.png`,
                },
                description: `**${temp}°C** *(from ${mintemp}°C to ${maxtemp}°C)*
                **Wind speed:** *${windspeed} m/s*
                **Clouds:** *${clouds}%*
                **Pressure:** *${pressure} hpa*`,
            }

            return message.channel.send({ embed: embed });
        }
        catch (err) {
            return console.error(err);
        }
    }
    return apiCall();
};

module.exports.help = {
    name: "weather",
    description: "Weather for a specific country/state/city. Non-english characters are not supported.",
    category: "Api",
    usage: "weather <city> [<state>] [<country code>]",
    example: "weather Hell US"
}