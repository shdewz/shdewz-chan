import 'dotenv/config';
import fetch from 'node-fetch';

const baseurl = 'https://osu.ppy.sh/api/v2';
let osuauth: any = { token: null, expires: 0 };

const emotes = [
    { name: 'XH', color: 0xcb1699, emoji: '<:rankingSSH:871388940836413471>' },
    { name: 'X', color: 0xcb1699, emoji: '<:rankingSS:871388941205508126>' },
    { name: 'SH', color: 0x01a9b7, emoji: '<:rankingSH:871388941281021963>' },
    { name: 'S', color: 0x01a9b7, emoji: '<:rankingS:871388941058732084>' },
    { name: 'A', color: 0x84d71c, emoji: '<:rankingA:871388941088096316>' },
    { name: 'B', color: 0xe2b130, emoji: '<:rankingB:871388941130014740>' },
    { name: 'C', color: 0xfb8a5a, emoji: '<:rankingC:871388941188747265>' },
    { name: 'D', color: 0xf45755, emoji: '<:rankingD:871388941151002665>' },
    { name: 'F', color: 0xe1e1e1, emoji: '<:rankingF:871388941222297620>' },
    { name: 'miss', color: 0xf52424, emoji: '<:miss:891674271800262706>' },
    { name: 'hit300', color: 0x26abf8, emoji: '<:hit300:891673481115238492>' },
    { name: 'hit100', color: 0x23ec57, emoji: '<:hit100:891673481568194610>' },
    { name: 'hit50', color: 0xedc936, emoji: '<:hit50:891673481538846730>' },
    { name: 'increase', color: 0x55ee5c, emoji: '<:increase:949320646318510121>' },
    { name: 'decrease', color: 0xf94c4c, emoji: '<:decrease:949320646301745252>' },
    { name: 'twitter', color: 0xdcddde, emoji: '<:twitter:949331827775135784>' },
    { name: 'discord', color: 0xdcddde, emoji: '<:discord:949331827460550757>' },
];

export const getEmote = (name: string) => { return emotes.find(r => r.name === name); };

export const getUser = async (user_id: string, mode: string) => {
    return await apiCall(baseurl + `/users/${user_id}${mode ? `/${mode}` : ''}`);
};

export const parseMode = (mode: string) => {
    const searchString = mode.replace('osu!', '').toLowerCase();
    const modes = [
        { mode: 'osu', aliases: ['osu', 'std', 'standard'] },
        { mode: 'taiko', aliases: ['taiko'] },
        { mode: 'fruits', aliases: ['fruits', 'catch'] },
        { mode: 'mania', aliases: ['mania'] },
    ]
    const _mode = modes.find(m => m.aliases.includes(searchString));
    return _mode?.mode || '';
}

const getAuth = async () => { return !osuauth.token || osuauth.expires - 5000 < Date.now() ? await authorize() : osuauth }

const authorize = async () => {
    let response = await fetch('https://osu.ppy.sh/oauth/token', {
        method: 'post',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'grant_type': 'client_credentials',
            'client_id': process.env.OSU_CLIENT_ID,
            'client_secret': process.env.OSU_CLIENT_SECRET,
            'scope': 'public'
        })
    });
    const token: any = await response.json();
    osuauth = { token: token, expires: Date.now() + token.expires_in };
    return osuauth;
}

const apiCall = async (url: string) => {
    const auth = await getAuth();
    const response = await fetch(url, { headers: { Authorization: `Bearer ${auth.token.access_token}` } });
    const data = await response.json();
    return data ?? null;
}