import { NextRequest, NextResponse } from "next/server";
import { checkIp } from "@/lib/vpn-check";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ip = body.ip;

  if (!ip || typeof ip !== "string") {
    return NextResponse.json({ error: "Missing or invalid 'ip' field" }, { status: 400 });
  }

  try {
    const result = await checkIp(ip);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
