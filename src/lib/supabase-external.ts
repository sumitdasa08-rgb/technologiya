// Hardcoded external Supabase project for blog features
export const EXT_SUPABASE_URL = 'https://lwuebemrzpublhrsyjmx.supabase.co';
export const EXT_SUPABASE_KEY = 'f4483fcca2ba2849d410653c29676440b1b1ca2366f40e82fa6b8d874767a3af';

export const extHeaders = {
  'apikey': EXT_SUPABASE_KEY,
  'Authorization': `Bearer ${EXT_SUPABASE_KEY}`,
};

export const extHeadersJson = {
  ...extHeaders,
  'Content-Type': 'application/json',
};

export async function extFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${EXT_SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      ...extHeaders,
      ...options?.headers,
    },
  });
  return res;
}

export async function extFetchJson<T = any>(path: string, options?: RequestInit): Promise<T> {
  const res = await extFetch(path, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 300)}`);
  }
  return res.json();
}
