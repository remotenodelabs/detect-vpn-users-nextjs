import type { VpnCheckResult } from "@/lib/vpn-check";

const badgeColors = {
  allow: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  verify:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  block: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
} as const;

function scoreBarColor(score: number) {
  if (score >= 70) return "bg-red-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-green-500";
}

const detailLabels: Record<string, string> = {
  country: "Country",
  country_code: "Country Code",
  asn: "ASN",
  organization: "Organization",
  company: "Company",
  company_type: "Company Type",
  datacenter: "Datacenter",
};

export function ResultCard({ result }: { result: VpnCheckResult }) {
  const flags = [
    { label: "VPN", value: result.is_vpn },
    { label: "Proxy", value: result.is_proxy },
    { label: "Tor", value: result.is_tor },
    { label: "Relay", value: result.is_relay },
    { label: "Datacenter", value: result.is_hosting },
  ];

  const details = Object.entries(result.details).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );

  return (
    <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      {/* IP */}
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-lg font-semibold">{result.ip}</span>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase ${badgeColors[result.recommendation]}`}
        >
          {result.recommendation}
        </span>
      </div>

      {/* Risk score bar */}
      <div className="mt-4 space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Risk Score</span>
          <span className="font-mono font-semibold">{result.risk_score}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all ${scoreBarColor(result.risk_score)}`}
            style={{ width: `${result.risk_score}%` }}
          />
        </div>
      </div>

      {/* Flags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {flags.map(({ label, value }) => (
          <span
            key={label}
            className={`rounded-full px-3 py-0.5 text-xs font-medium ${
              value
                ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
            }`}
          >
            {label}: {value ? "Yes" : "No"}
          </span>
        ))}
      </div>

      {/* Details table */}
      {details.length > 0 && (
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {details.map(([key, value]) => (
            <div key={key} className="contents">
              <dt className="text-zinc-500 dark:text-zinc-400">
                {detailLabels[key] ?? key}
              </dt>
              <dd className="font-mono">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {result.cached && (
        <p className="mt-3 text-xs text-zinc-400">Served from cache</p>
      )}
    </div>
  );
}
