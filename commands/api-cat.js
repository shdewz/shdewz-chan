const axios = require("axios");

module.exports.run = async (message) => {
    try {
        const api = axios.create({
            baseURL: 'https://aws.random.cat/meow',
        });

        api.get().then(response => {
            return message.channel.send(response.data.file);
        }).catch(err => {
            message.channel.send("error fetching cat");
            return console.error(err);
        });
    }
    catch (err) {
        message.channel.send("error fetching cat");
        return console.error(err);
    }
};

module.exports.help = {
    name: "cat",
    description: "A cat joins the chat!",
    category: "Api"
}