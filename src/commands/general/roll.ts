import { Client, Message } from 'discord.js';
import { getNameString, parseArgs, plural } from '../../helpers/utils';

const attributes = {
    name: 'roll',
    group: 'General',
    aliases: [],
    description: 'Roll a random number.\n**Usage:** `{{prefix}}roll [min] [max]`',
    params: []
}

export const { name, group, aliases, description, params } = attributes;

export const execute = (client: Client, message: Message, _args: string[], prefix: string) => {
    const args: any = parseArgs(_args.slice(1));
    const nums = args._.filter((e: any) => !isNaN(e));
    const start = nums.length > 1 ? nums[0] : 1;
    const end = nums.length > 1 ? nums[1] : nums[0] ?? 100;
    const randomNumber = start + Math.floor(Math.random() * (end - start + 1));

    message.reply(`🎲 **${getNameString(message)}** rolls **${randomNumber}** point${plural(randomNumber)}!`);
};
