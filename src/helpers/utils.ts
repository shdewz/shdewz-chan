import yargs from 'yargs';
import numeral from 'numeral';
import { Message } from 'discord.js';

export const getArgs = (args: string[]) => {
    return yargs(args).parserConfiguration({ 'short-option-groups': false }).parseSync();
};

export const formatNum = (num: number, format: string) => numeral(num).format(format);
export const plural = (num: number) => num === 1 ? '' : 's';

export const randomString = (str: string) => {
    const match = str.match(/{r:(\d+)-(\d+)}/);
    if (match) {
        const diff = Number(match[2]) - Number(match[1]);
        const num = Number(match[1]) + Math.floor(Math.random() * diff);
        return str.replace(/{r:(\d+)-(\d+)}/, num.toString());
    }
    return str;
};

export const getNameString = (message: Message) => message.member?.nickname || message.author.globalName || message.author.username;
