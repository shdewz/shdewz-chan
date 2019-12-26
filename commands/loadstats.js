const fs = require("fs");

module.exports.run = function ()
{
    try
    {
        if (fs.existsSync("stats.json"))
        {
            var stat = JSON.parse(fs.readFileSync("stats.json", "utf-8"));
            return stat;
        }
        else
        {
            stat = {
                "captains": [
                ],
                "sold": [
                ],
                "unsold": [
                ],
                "players": [
                ]
            };

            fs.writeFileSync("stats.json", JSON.stringify(stat), function (err)
            {
                if (err) console.log("error", err);

                console.log("Stats created succesfully\n" + stat + "\n\n")
                return stat;
            });
        }
    }
    catch (error)
    {
        console.log(error);
        return;
    }
};

module.exports.help = {
    name: "loadstats"
}