const axios = require("axios");

module.exports.run = async (message) => {
    const api = axios.create({
        baseURL: 'https://random.dog/woof.json',
    });

    api.get().then(response => {
        return message.channel.send(response.data.url);
    });
};

module.exports.help = {
    name: "dog"
}