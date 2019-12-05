module.exports = {
    name: 'bid.abort',
    description: 'Bids in auction.',
    execute(message, args, stat)
    {
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(`Insufficient permissions`);
        if (!biddingActive) return message.reply(`no active auctions.`);
        message.channel.send(`Auction aborted :pensive:`);
        biddingActive = false;
        return;
    }
};