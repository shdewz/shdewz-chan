import * as osu from 'osu-api-v2-js';

const clientId = Number(process.env.OSU_CLIENT_ID);
const clientSecret = process.env.OSU_CLIENT_SECRET;

if (!Number.isInteger(clientId) || clientId <= 0) {
  throw new Error('OSU_CLIENT_ID must be a valid positive integer');
}

if (!clientSecret) {
  throw new Error('OSU_CLIENT_SECRET must be set');
}

export const api = new osu.API(clientId, clientSecret);
