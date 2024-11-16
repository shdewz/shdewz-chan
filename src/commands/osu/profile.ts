import { Client, Message } from 'discord.js';
import { parseArgs, formatNum, plural } from '../../helpers/utils';
import { getUser, parseMode, getEmote } from 'src/helpers/osu';
import userSchema from '../../schemas/user'

const attributes = {
    name: 'osu',
    group: 'osu!',
    aliases: ['osu-profile'],
    description: `Show someone's osu! profile.`,
    params: [
        { name: `mode <osu/taiko/catch/mania>`, description: `Specify the gamemode. Defaults to the user's selected main gamemode.` }
    ]
}

export const { name, group, aliases, description, params } = attributes;

export const execute = async (client: Client, message: Message, _args: string[], prefix: string) => {
    const args: any = parseArgs(_args.slice(1));
    const userSettings = await userSchema.findOne({ user_id: message.author.id });

    const mode = parseMode(args.mode || '');
    const modetext = mode === 'osu' ? '' : mode === 'fruits' ? 'catch' : mode;
    let userString = args._.join(' ');

    if (userString === '') {
        if (userSettings?.prefs?.osu?.user_id) userString = userSettings.prefs.osu.user_id;
        else return message.reply({ embeds: [{ description: `**You have not linked your osu! account yet!**\nDo it with the command \`${prefix}set -osu <user>\`` }] });
    }

    const user: any = await getUser(userString, mode);
    if (!user?.id) return message.reply({ embeds: [{ description: `**User \`${userString}\` not found!**` }] });

    const stats = user.statistics;

    const lines = [
        !stats.global_rank ? null : {
            separator: ' • ', indent: '> ',
            content: [
                `**#${formatNum(stats.global_rank, '0,0')}**`,
                `:flag_${user.country_code.toLowerCase()}: #${formatNum(stats.country_rank, '0,0')}`,
            ]
        },
        {
            separator: ' • ', indent: '> ',
            content: [
                !stats.pp ? null : `**${formatNum(stats.pp, '0,0')}** pp`,
                `**${stats.hit_accuracy.toFixed(2)}%** accuracy`
            ]
        },
        {
            separator: ' • ', indent: '> ',
            content: [
                `level **${stats.level.current}.${stats.level.progress}**`,
                `**${user.user_achievements.length}** medals`
            ]
        },
        user.badges.length === 0 && user.scores_first_count === 0 ? null : {
            separator: ' • ', indent: '> ',
            content: [
                user.badges.length > 0 ? `**${user.badges.length}** badge${plural(user.badges.length)}` : null,
                user.scores_first_count > 0 ? `**${formatNum(user.scores_first_count, '0,0')}** first place${plural(user.scores_first_count)}` : null
            ]
        },
        !stats.global_rank ? null : {
            separator: ' • ', indent: '> ',
            content: [
                `peak **#${formatNum(user.rank_highest.rank, '0,0')}** <t:${Math.round(new Date(user.rank_highest.updated_at).valueOf() / 1000)}:R>`,
            ]
        },
        { separator: '', indent: '', content: ['\u200b'] },
        {
            separator: ' • ', indent: '> ',
            content: [
                `**${formatNum(stats.play_count, '0,0')}** playcount`,
                `**${formatNum(Math.round(stats.play_time / 60 / 60), '0,0')}** hours`
            ]
        },
        {
            separator: ' • ', indent: '> ',
            content: [`**${formatNum(stats.ranked_score, '0.00a')}** ranked score`, `**${formatNum(stats.total_score, '0.00a')}** total`]
        },
        user.ranked_beatmapset_count == 0 ? null : {
            separator: '', indent: '> ', content: [
                `**${user.ranked_beatmapset_count}** ranked mapset${plural(user.ranked_beatmapset_count)}`
            ]
        },
        user.loved_beatmapset_count == 0 ? null : {
            separator: '', indent: '> ', content: [
                `**${user.loved_beatmapset_count}** loved mapset${plural(user.loved_beatmapset_count)}`
            ]
        },
        user.guest_beatmapset_count == 0 ? null : {
            separator: '', indent: '> ', content: [
                `**${user.guest_beatmapset_count}** guest ${user.guest_beatmapset_count == 1 ? 'difficulty' : 'difficulties'}`
            ]
        },
        {
            separator: ' ', indent: '> ',
            content: [
                `${getEmote('XH')?.emoji} **${stats.grade_counts.ssh}**`,
                `${getEmote('X')?.emoji} **${stats.grade_counts.ss}**`,
                `${getEmote('SH')?.emoji} **${stats.grade_counts.sh}**`,
                `${getEmote('S')?.emoji} **${stats.grade_counts.s}**`,
                `${getEmote('A')?.emoji} **${stats.grade_counts.a}**`,
            ]
        },
        { separator: '', indent: '', content: ['\u200b'] },
        {
            separator: ' • ', indent: '> ',
            content: [
                `joined <t:${Math.round(new Date(user.join_date).valueOf() / 1000)}:R>`,
                user.is_online ? 'currently online' : user.last_visit ? `last seen <t:${Math.round(new Date(user.last_visit).valueOf() / 1000)}:R>` : null,
            ]
        },
        !user.twitter && !user.discord ? null : {
            separator: ' • ', indent: '> ',
            content: [
                user.discord ? `${getEmote('discord')?.emoji} **${user.discord}**` : null,
                user.twitter ? `${getEmote('twitter')?.emoji} **[@${user.twitter}](https://twitter.com/${user.twitter})**` : null,
            ]
        },
    ];

    message.reply({
        embeds: [{
            color: !user.profile_colour ? undefined : parseInt(user.profile_colour.substr(1), 16),
            author: {
                name: `osu!${cleanMode(mode === '' ? user.playmode : modetext)} profile for ${user.username}`,
                icon_url: `https://assets.ppy.sh/old-flags/${user.country_code}.png`,
                url: `https://osu.ppy.sh/users/${user.id}${mode === '' ? '' : `/${mode}`}`,
            },
            title: !user.title ? '' : user.title,
            description: lines.filter(e => e !== null).map(line => line.indent + line.content.filter(e => e).join(line.separator)).join('\n'),
            thumbnail: { url: user.avatar_url }
        }]
    })
};

const cleanMode = (mode: string) => mode === 'osu' ? '' : mode === 'fruits' ? 'catch' : mode;
