import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { webhookSecret } from "@/lib/github";

export const runtime = "nodejs"; // use Node runtime for crypto

function safeTimingEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function verifySignature256(payload: string, signature: string | null) {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", webhookSecret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  return safeTimingEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-hub-signature-256");
  const event = req.headers.get("x-github-event");
  const id = req.headers.get("x-github-delivery");

  const ok = verifySignature256(raw, sig);
  if (!ok) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  const body = JSON.parse(raw || "{}");

  // Example reactions — expand as needed
  if (event === "installation_repositories") {
    console.log("[webhook] repos changed", body?.action);
  }
  if (event === "push") {
    console.log("[webhook] push ->", body?.repository?.full_name, body?.ref);
  }
  if (event === "workflow_run") {
    console.log("[webhook] workflow_run status:", body?.action, body?.workflow_run?.conclusion);
  }

  return NextResponse.json({ ok: true, id, event });
}
