const axios = require("axios");

module.exports.run = async (message) => {
    const api = axios.create({
        baseURL: 'https://randomfox.ca/floof/',
    });

    api.get().then(response => {
        return message.channel.send(response.data.image);
    });
};

module.exports.help = {
    name: "fox",
    description: "A wild fox invades the chat",
    category: "Api"
}