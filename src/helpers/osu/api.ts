import 'dotenv/config';
import fetch from 'node-fetch';
const baseurl = 'https://osu.ppy.sh/api/v2';
const osuauth: any = { token: null, expires: 0 };

export const getUser = async (userID: string, mode: string) => {
    return await apiCall(baseurl + `/users/${userID}${mode ? `/${mode}` : ''}`);
};

export const getScores = async (userID: string, beatmapID: string, mode: string) => {
    return await apiCall(baseurl + `/beatmaps/${beatmapID}/scores/users/${userID}/all?mode=${mode}`);
};

export const getRecentScores = async (userID: string, mode: string, includeFails: boolean = true, limit: number = 1) => {
    return await apiCall(baseurl + `/users/${userID}/scores/recent?mode=${mode}&include_fails=${includeFails}&limit=${limit}`);
};

export const getBeatmap = async (beatmapID: string) => {
    const beatmap: any = await apiCall(baseurl + `/beatmaps/${beatmapID}`);
    return beatmap;
};

const getAuth = async () => { return osuauth.token === null || osuauth.expires - 5000 < Date.now() ? await authorize() : osuauth; };

const authorize = async () => {
    const response = await fetch('https://osu.ppy.sh/oauth/token', {
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
    osuauth.token = token;
    osuauth.expires = Date.now() + token.expires_in;
    return osuauth;
};

const apiCall = async (url: string) => {
    const auth = await getAuth();
    const response = await fetch(url, { headers: { Authorization: `Bearer ${auth.token.access_token}` } });
    const data = await response.json();
    return data;
};
