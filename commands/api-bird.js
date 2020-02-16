const axios = require("axios");

module.exports.run = async (message, args) => {
    const api = axios.create({
        baseURL: 'http://shibe.online/api',
    });

    var count
    if (args.length > 0 && !isNaN(args[0])) {
        if (args[0] > 5) return message.reply("bird overload!");

        count = args[0];
    }
    else count = 1;

    api.get('/birds', { params: { count: count } }).then(response => {
        for (var i = 0; i < count; i++){
            message.channel.send(response.data[i]);
        }
        return;
    });
};

module.exports.help = {
    name: "bird",
    description: "Summons a bird to the chat.",
    category: "Api"
}