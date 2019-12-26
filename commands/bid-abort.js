module.exports.run = async (client, message, args) => {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`Insufficient permissions`);
        if (!biddingActive) return message.reply(`no active auctions.`);
        message.channel.send(`Auction aborted :pensive:`);
        biddingActive = false;
        return;
};

module.exports.help = {
    name: "bid.abort"
}