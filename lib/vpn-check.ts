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

function computeRisk(data: {
  is_vpn: boolean;
  is_proxy: boolean;
  is_tor: boolean;
  is_relay: boolean;
  is_hosting: boolean;
}): { score: number; recommendation: "allow" | "verify" | "block" } {
  let score = 0;
  if (data.is_tor) score += 80;
  if (data.is_vpn) score += 60;
  if (data.is_proxy) score += 50;
  if (data.is_relay) score += 40;
  if (data.is_hosting) score += 30;
  score = Math.min(score, 100);

  let recommendation: "allow" | "verify" | "block" = "allow";
  if (score >= 70) recommendation = "block";
  else if (score >= 40) recommendation = "verify";

  return { score, recommendation };
}

export async function checkIp(ip: string): Promise<VpnCheckResult> {
  const cached = cache.get(ip);
  if (cached && cached.expires > Date.now()) {
    return cached.result;
  }

  const apiKey = process.env.VPNSIGNAL_API_KEY;
  if (!apiKey) {
    throw new Error("VPNSIGNAL_API_KEY is not set");
  }

  const baseUrl =
    process.env.VPNSIGNAL_API_URL ?? "https://api.vpnsignal.io/v1";
  const res = await fetch(`${baseUrl}/check`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ip }),
  });

  if (!res.ok) {
    // Surface client/validation errors so the caller can show them
    const body = await res.json().catch(() => null);
    const message = body?.detail ?? `API error (${res.status})`;
    throw new Error(message);
  }

  const data = await res.json();
  const { score, recommendation } = computeRisk(data);

  const result: VpnCheckResult = {
    ip: data.ip ?? ip,
    is_vpn: data.is_vpn ?? false,
    is_proxy: data.is_proxy ?? false,
    is_tor: data.is_tor ?? false,
    is_relay: data.is_relay ?? false,
    is_hosting: data.is_hosting ?? false,
    risk_score: score,
    recommendation,
    details: data.details ?? {},
    cached: data.cached ?? false,
  };

  cache.set(ip, { result, expires: Date.now() + CACHE_TTL });
  return result;
}
