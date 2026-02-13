# Detect VPN Users in Next.js

A minimal example showing how to detect VPN, proxy, Tor, and datacenter IPs in a Next.js application using [VPN Signal](https://vpnsignal.io).

## What it does

- **Auto-detects** the visitor's IP on page load (server component)
- **Manual lookup** — enter any IP address to check it
- **Risk scoring** — color-coded score bar with allow / verify / block recommendation
- **Fail-open** — if the API is unreachable, the page still renders normally
- **In-memory cache** — results are cached for 1 hour to avoid duplicate calls

## Quick start

```bash
# Clone and install
git clone https://github.com/remotenodelabs/detect-vpn-users-nextjs
cd detect-vpn-users-nextjs
pnpm install

# Add your API key
cp .env.example .env.local
# Edit .env.local and set VPNSIGNAL_API_KEY

# Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
lib/vpn-check.ts        — Reusable check function (cache + fail-open)
app/api/check/route.ts  — POST /api/check endpoint
app/page.tsx            — Server component (auto-detects visitor IP)
app/ip-checker.tsx      — Client component (manual IP input form)
app/result-card.tsx     — Shared result display component
```

## How it works

1. The home page is a **server component** that reads `x-forwarded-for` to get the visitor's IP and calls VPN Signal's API server-side.
2. For manual lookups, the client-side form POSTs to `/api/check`, which proxies the request through the Next.js API route so the API key stays secret.
3. Risk scores are computed from detection flags (VPN +60, Proxy +50, Tor +80, Relay +40, Datacenter +30) and capped at 100.

## Learn more

- [VPN Signal](https://vpnsignal.io) — VPN/Proxy/Tor detection API
- [Next.js Documentation](https://nextjs.org/docs)
