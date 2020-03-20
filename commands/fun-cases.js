const cases = require("../cases.json");

const rarityColors = [0xffd666, 0xff6161, 0xff45c4, 0xb87aff, 0x669eff];
const odds = [0.25575, 0.63939, 3.19693, 15.98465, 79.92327];

module.exports.run = async (message, args) => {

    // return if no args specified
    if (args.length == 0) return;

    // 'cases[0]' refers to the first case. If multiple cases exist and a specific one is requested, use:
    /*
    var caseIndex = 0;
    for (var i = 0; i = cases.length; i++) {
        if (cases[i].name == "name-of-case"){
            caseIndex = i;
            break;
        }
    }
    */
   // and then replace all instances of 'cases[0]' with 'cases[caseIndex]'

   // preview case contents
    if (args[0].toLowerCase() == "preview") {
        var itemList = "";
        for (var i = 0; i < cases[0].items.length; i++) {
            itemList += cases[0].items[i].name + "\n";
        }

        // make the embed
        let embed = {
            color: message.member.displayColor,
            fields: [
                {
                    name: `*Items in the case **${cases[0].name}:***`,
                    value: `${itemList}`
                }
            ]
        }
        // send the embed
        return message.channel.send({ embed: embed });
    }

    // open a case
    else if (args[0].toLowerCase() == "open") {
        var repeat = 1; // for opening multiple at once
        var messageList = ""; // combined text object for all of the received items
        var highestValue = 10; // best rarity in the batch, where 0=knife, 1=red, ...
        var totalPrice = 0; // total price of the received items

        // check if they want to open more than one
        if (args.length > 1 && !isNaN(args[1])) {
            repeat = args[1];
            if (repeat > 20) return message.reply("you can only open up to 20 cases at once!"); // limit to 20 because
        }
        // loop for however many they want to open
        for (var n = 0; n < repeat; n++) {
            var rng = (Math.random() * 100); // pick a random value between 0 and 100
            // calculate the required rng value for each item rarity
            var knifeOdds = odds[0];
            var redOdds = odds[0] + odds[1];
            var pinkOdds = odds[0] + odds[1] + odds[2];
            var purpleOdds = odds[0] + odds[1] + odds[2] + odds[3];
            var blueOdds = odds[0] + odds[1] + odds[2] + odds[3] + odds[4];

            // was too lazy to add stattrak prices so this is disabled for now
            /*
            var stattrak = "";
            if ((Math.random() * 100) < 10) stattrak = "StatTrak™ ";
            */

            // see what rarity was received
            var result;
            if (rng < knifeOdds) result = 0; // knife
            else if (rng < redOdds) result = 1; // red
            else if (rng < pinkOdds) result = 2; // pink
            else if (rng < purpleOdds) result = 3; // purple
            else result = 4; // blue

            // find all possible items from the case with that rarity
            var possibleItems = [];
            for (var i = 0; i < cases[0].items.length; i++) {
                if (cases[0].items[i].rarity == result) {
                    possibleItems.push(cases[0].items[i]);
                }
            }
            // randomly select one of the items
            var itemRNG = Math.floor(Math.random() * possibleItems.length);
            var finalItem = possibleItems[itemRNG];

            // randomize the float value of the skin
            var float = (Math.random() * finalItem.maxfloat) + finalItem.minfloat;

            // see what quality that float lands on
            var quality;
            var qualityIndex;
            if (float < 0.07) { quality = "FN"; qualityIndex = 0; }
            else if (float < 0.15) { quality = "MW"; qualityIndex = 1; }
            else if (float < 0.38) { quality = "FT"; qualityIndex = 2; }
            else if (float < 0.45) { quality = "WW"; qualityIndex = 3; }
            else { quality = "BS"; qualityIndex = 4; }

            // find the price of the skin
            var price = finalItem.price[qualityIndex];
            totalPrice += price;

            // add the skin to the message
            messageList += `**${finalItem.name}** (${quality}) - *${Number(price).toFixed(2)}€*\n`
            // use if stattraks enabled
            //messageList += stattrak + finalItem.name + "\n"

            // see if the rarity is higher than before
            if (result < highestValue) highestValue = result;
        }

        // make the embed
        let embed = {
            color: rarityColors[highestValue], // assign color based on the best received item
            fields: [
                {
                    name: `**${cases[0].name}**\n*Received item(s):*`,
                    value: `${messageList}\n*Total opening cost:* ***${Number(repeat * cases[0].price).toFixed(2)}€***\n*Total skin value:* ***${Number(totalPrice).toFixed(2)}€***\n*Profit:* ***${Number(totalPrice - repeat * cases[0].price).toFixed(2)}€***`
                }
            ]
        }
        // send everything
        return message.channel.send({ embed: embed });
    }

};

module.exports.help = {
    name: "case",
    description: "Open the Weapon Case 1",
    usage: "case open",
    category: "Fun"
}