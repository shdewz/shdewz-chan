const TOKEN_URL = 'https://osu.ppy.sh/oauth/token';
const BUFFER_MS = 30 * 1000; // 30 seconds

type TokenState = {
  accessToken: string;
  expiresAt: number;
} | null;

let tokenState: TokenState = null;

const authorize = async (): Promise<string> => {
  const clientId = process.env.OSU_CLIENT_ID;
  const clientSecret = process.env.OSU_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('OSU_CLIENT_ID and OSU_CLIENT_SECRET must be set');
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'public',
    }),
  });

  if (!response.ok) throw new Error(`osu! auth failed: ${response.status}`);

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenState = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - BUFFER_MS,
  };

  return tokenState.accessToken;
};

export const getAccessToken = async (): Promise<string> => {
  if (tokenState && tokenState.expiresAt > Date.now())
    return tokenState.accessToken;
  return authorize();
};

export const apiCall = async <T>(url: string): Promise<T> => {
  const token = await getAccessToken();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok)
    throw new Error(`osu! API error: ${response.status} ${url}`);
  return response.json() as Promise<T>;
};
