const math = require("mathjs");

module.exports.run = async (message, args) => {
    let equation = args.join(" ");
    let answer = math.evaluate(equation);
    if (countDecimals(answer) > 2) {
        return message.reply(`**${equation}** is **${answer}** *≈ ${answer.toFixed(2)}*`);
    }
    else return message.reply(`**${equation}** is **${answer}**`);
};

module.exports.help = {
    name: "math",
    description: "counts stuff",
    usage: "math <equation>",
    category: "Tools"
}

function countDecimals (value) {
    if(Math.floor(value) === value) return 0;
    return value.toString().split(".")[1].length || 0; 
}