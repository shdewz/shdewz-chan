const { GoogleSpreadsheet } = require("google-spreadsheet");
const config = require("./config.json");
const moment = require("moment");

module.exports = {
    loadUsers: async (sheet_id, sheet_page, filter, teamsize, outside, remaining) => {
        return new Promise(async resolve => {
            let doc = new GoogleSpreadsheet(sheet_id);
            await doc.useServiceAccountAuth(config.keys.sheet_creds);
            await doc.loadInfo();

            const sheet = doc.sheetsById[sheet_page];
            const rows = await sheet.getRows();

            let output = [];
            let returnrows = filter ? rows.filter(r => r[filter] !== "undefined" && r[filter] !== "") : rows;
            if (outside) returnrows = returnrows.filter(r => r["Outside"] !== "x");
            if (remaining) returnrows = returnrows.filter(r => r["in"] !== "x");

            returnrows.forEach(r => {
                let obj = {
                    name: teamsize == 1 ? "" : r["Team Name"],
                    players: []
                }
                for (var i = 0; i < teamsize; i++) {
                    if (r[`Username${teamsize == 1 ? "" : i + 1}`] == "") continue;
                    obj.players.push({
                        username: r[`Username${teamsize == 1 ? "" : i + 1}`],
                        discord: r[`Discord${teamsize == 1 ? "" : i + 1}`],
                        tier: !r[`Tier`] ? 1 : Number(r[`Tier`]),
                        captain: teamsize == 1 ? false : i == 0 ? true : false
                    });
                }
                output.push(obj);
            });

            resolve(output);
        }).catch(err => { console.log(err); resolve({ error: `**${err.name}:** ${err.message}` }); });
    }
}