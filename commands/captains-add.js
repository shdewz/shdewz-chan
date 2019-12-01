const fs = require("fs");
const config = require("../config.json");

module.exports = {
    name: 'captains.add',
    description: 'Adds captain(s) to the list.',
    execute(message, args, stat)
    {
        if (!message.member.hasPermission("ADMINISTRATOR")) { message.channel.send(`Insufficient permissions`); return; } // return if no perms
        if (args.length < 1) { message.channel.send(`Too few arguments.`); return; } // return if no args

        // declare some stuff
        var captainList = [];
        var cptListText = "";
        var cptListTextMissing = "";
        var nameExists = false;
        var startmoney = config.startmoney;

        for (var i = 0; i < args.length; i++)
        {
            nameExists = false;

            for (var ii = 0; ii < stat.captains.length; ii++) // go through the list
            {
                if (stat.captains[ii].name == args[i]) // see if name exists in captains list
                {
                    cptListTextMissing += `\`${args[i]}\`, `;
                    nameExists = true;
                    break;
                }
            }

            if (!nameExists)
            {
                captainList.push(args[i]);
                cptListText += `\`${args[i]}\`, `;
                var obj = { "name": args[i], "money": startmoney, "slaves": [] };
                stat.captains.push(obj);
            }
        }

        if (cptListTextMissing != "")
        {
            cptListTextMissing = cptListTextMissing.substring(0, cptListTextMissing.length - 2);
            message.channel.send(`\`${cptListTextMissing}\` already exist(s) as captain(s).`);
        }

        if (cptListText != "")
        {
            cptListText = cptListText.substring(0, cptListText.length - 2);

            fs.writeFile("stats.json", JSON.stringify(stat), function (err)
            {
                if (err) console.log("error", err);

                message.channel.send(`Succesfully added ${cptListText} as captain(s).`);
                console.log(stat.captains);
                return;
            });
        }
    }
};