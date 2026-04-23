export function getEnv(name, fallback = undefined) {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return value;
}

export function requireEnv(name) {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function resolveCredentials(overrides = {}) {
  return {
    accessToken: overrides.accessToken || getEnv('TIKTOK_ACCESS_TOKEN'),
    advertiserId: overrides.advertiserId || getEnv('TIKTOK_ADVERTISER_ID'),
    baseUrl: overrides.baseUrl || getEnv('TIKTOK_API_BASE_URL', 'https://business-api.tiktok.com')
  };
}
