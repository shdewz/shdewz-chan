const axios = require("axios");

module.exports.run = async (message) => {
    axios({
        "method": "GET",
        "url": "https://matchilling-chuck-norris-jokes-v1.p.rapidapi.com/jokes/random",
        "headers": {
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "matchilling-chuck-norris-jokes-v1.p.rapidapi.com",
            "x-rapidapi-key": "b877b4e1bcmsh478513c9c02c645p198796jsn56d92d468cb0",
            "accept": "application/json"
        }
    })
        .then((response) => {
            return message.channel.send(`**Did you know?**\n*${response.data.value}*`);
        })
        .catch((error) => {
            console.log(error);
        })
};

module.exports.help = {
    name: "norris",
    description: "Chuck norris fact on demand",
    category: "Api"
}