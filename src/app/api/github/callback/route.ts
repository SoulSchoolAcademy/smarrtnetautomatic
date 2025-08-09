import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID as string;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect("/");

  // Exchange code for user access token
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
  });
  const json = await res.json();
  // You can set a cookie/session here; for demo, just echo result (never do this in prod)
  return NextResponse.json({ received: true, token: !!json.access_token });
}
