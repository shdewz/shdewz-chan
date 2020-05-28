const axios = require("axios");

module.exports.run = async (message, args) => {
    const api = axios.create({
        baseURL: 'https://cat-fact.herokuapp.com',
    });

    api.get('/facts/random').then(response => {
        response = response.data;
        return message.channel.send(`**Did you know?**\n*${response.text}*`);
    });
};

module.exports.help = {
    name: "catfact",
    description: "Tells a random fact related to cats in some level",
    category: "Api"
}