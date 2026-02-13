export interface VpnCheckResult {
  ip: string;
  is_vpn: boolean;
  is_proxy: boolean;
  is_tor: boolean;
  is_relay: boolean;
  is_hosting: boolean;
  risk_score: number;
  recommendation: "allow" | "verify" | "block";
  details: Record<string, string | undefined>;
  cached: boolean;
}

interface CacheEntry {
  result: VpnCheckResult;
  expires: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function checkIp(ip: string): Promise<VpnCheckResult> {
  const cached = cache.get(ip);
  if (cached && cached.expires > Date.now()) {
    return cached.result;
  }

  const apiKey = process.env.VPNSIGNAL_API_KEY;
  if (!apiKey) {
    throw new Error("VPNSIGNAL_API_KEY is not set");
  }

  // Add timeout to prevent hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const res = await fetch("https://api.vpnsignal.io/v1/check", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ip }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message = body?.detail ?? `API error (${res.status})`;
      throw new Error(message);
    }

    const data: VpnCheckResult = await res.json();

    const result: VpnCheckResult = {
      ip: data.ip,
      is_vpn: data.is_vpn,
      is_proxy: data.is_proxy,
      is_tor: data.is_tor,
      is_relay: data.is_relay,
      is_hosting: data.is_hosting,
      risk_score: data.risk_score,
      recommendation: data.recommendation,
      details: data.details,
      cached: data.cached,
    };

    cache.set(ip, { result, expires: Date.now() + CACHE_TTL });
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout: VPN API took too long to respond");
    }
    throw error;
  }
}
