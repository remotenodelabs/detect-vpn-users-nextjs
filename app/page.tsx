import { headers } from "next/headers";
import { checkIp } from "@/lib/vpn-check";
import { IpChecker } from "./ip-checker";
import { ResultCard } from "./result-card";

export default async function Home() {
  const hdrs = await headers();
  const forwarded = hdrs.get("x-forwarded-for");
  const visitorIp = forwarded?.split(",")[0]?.trim() ?? null;

  let autoResult = null;
  if (visitorIp) {
    try {
      autoResult = await checkIp(visitorIp);
    } catch {
      // fail open — page still renders
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 font-sans">
      <main className="w-full max-w-lg space-y-10">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            VPN Detection Demo
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Detect VPNs, proxies, Tor exits, and datacenter IPs in real time.
          </p>
        </div>

        {/* Auto-detected visitor result */}
        {autoResult && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
              Your IP
            </h2>
            <ResultCard result={autoResult} />
          </section>
        )}

        {/* Manual lookup */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            Check any IP
          </h2>
          <IpChecker />
        </section>

        <footer className="pt-6 text-center text-xs text-zinc-400">
          Powered by{" "}
          <a
            href="https://vpnsignal.io"
            className="underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300"
            target="_blank"
            rel="noopener"
          >
            VPN Signal
          </a>
        </footer>
      </main>
    </div>
  );
}
