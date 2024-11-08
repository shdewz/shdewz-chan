import yargs from 'yargs';
import numeral from 'numeral';

export const parseArgs = (args: string[]) => {
    return yargs(args).parserConfiguration({ 'short-option-groups': false }).parse();
}

export const formatNum = (num: number, format: string) => numeral(num).format(format);
export const plural = (num: number) => num === 1 ? '' : 's';