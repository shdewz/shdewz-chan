const fs = require("fs");

module.exports = {
    name: 'captains.remove',
    description: 'Removes captain(s) from list.',
    execute(message, args, stat)
    {
        if (!message.member.hasPermission("ADMINISTRATOR")) { message.channel.send(`Insufficient permissions`); return; } // return if no perms
        if (args.length < 1) { message.channel.send(`Too few arguments.`); return; } // return if no args

        // declare some stuff
        var cptListText = "";
        var cptListTextMissing = "";
        var index = undefined;

        for (var i = 0; i < args.length; i++)
        {
            var index = stat.captains.findIndex(x => x.name === args[i]);
            if (index !== undefined)
            {
                stat.captains.splice(index, 1);
                cptListText += `\`${args[i]}\`, `;
            }
            else
            {
                cptListTextMissing += `\`${args[i]}\`, `;
            }
        }

        cptListText = cptListText.substring(0, cptListText.length - 2);
        cptListTextMissing = cptListTextMissing.substring(0, cptListTextMissing.length - 2);

        fs.writeFile("stats.json", JSON.stringify(stat), function (err)
        {
            if (err) console.log("error", err);

            if (cptListTextMissing != "")
            {
                message.channel.send(`${cptListTextMissing} not found from captains.`);
            }
            if (cptListText != "")
            {
                message.channel.send(`Succesfully removed ${cptListText} from captains.`);
            }
            console.log(stat.captains);
            return;
        });
    }
};