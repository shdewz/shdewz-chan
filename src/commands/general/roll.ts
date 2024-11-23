import { Client, Message } from 'discord.js';
import { getNameString, getArgs, plural } from '../../helpers/utils.js';

export const attributes = {
    name: 'roll',
    group: 'General',
    aliases: [],
    description: 'Roll a random number.\n**Usage:** `{{prefix}}roll [min] [max]`',
    params: []
}

export const execute = (_client: Client, message: Message, _args: string[], _prefix: string) => {
    const args: any = getArgs(_args.slice(1));
    const nums = args._.filter((e: any) => !isNaN(e));
    const start = nums.length > 1 ? nums[0] : 1;
    const end = nums.length > 1 ? nums[1] : nums[0] ?? 100;
    const randomNumber = start + Math.floor(Math.random() * (end - start + 1));

    message.reply(`🎲 **${getNameString(message)}** rolls **${randomNumber}** point${plural(randomNumber)}!`);
};
