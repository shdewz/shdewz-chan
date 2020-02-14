const axios = require("axios");

module.exports.run = async (message) => {
    const api = axios.create({
        baseURL: 'https://aws.random.cat/meow',
    });

    api.get().then(response => {
        return message.channel.send(response.data.file);
    });
};

module.exports.help = {
    name: "cat"
}