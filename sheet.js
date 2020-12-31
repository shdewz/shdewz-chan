const { GoogleSpreadsheet } = require("google-spreadsheet");
const config = require("./config.json");
const moment = require("moment");

module.exports = {
    loadUsers: async (sheet_id, sheet_page, filter, outside, remaining) => {
        return new Promise(async resolve => {
            let doc = new GoogleSpreadsheet(sheet_id);
            await doc.useServiceAccountAuth(config.keys.sheet_creds);
            await doc.loadInfo();

            const sheet = doc.sheetsById[sheet_page];
            const rows = await sheet.getRows();

            let output = { result: [] };
            let returnrows = filter ? rows.filter(r => r[filter] !== "undefined" && r[filter] !== "") : rows;
            if (outside) returnrows = returnrows.filter(r => r["Outside"] !== "x");
            if (remaining) returnrows = returnrows.filter(r => r["in"] !== "x");

            returnrows.forEach(r => {
                let obj = {
                    username: r["Username"],
                    discord: r["Discord"],
                    tier: !r["Tier"] ? 1 : Number(r["Tier"])
                }
                output.result.push(obj);
            });

            resolve(output);
        }).catch(err => { console.log(err); resolve({ error: `**${err.name}:** ${err.message}` }); });
    }
}