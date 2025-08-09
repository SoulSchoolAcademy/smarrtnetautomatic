import { NextResponse } from "next/server";
import { app, getFirstInstallationOctokit } from "@/lib/github";

export const runtime = "nodejs";

export async function GET() {
  // find first installation and list repos
  const jwt = await app.getSignedJsonWebToken();
  const installs: any = await fetch("https://api.github.com/app/installations", {
    headers: { Authorization: `Bearer ${jwt}`, Accept: "application/vnd.github+json" }
  }).then(r => r.json());

  if (!installs?.length) return NextResponse.json({ error: "No installations" }, { status: 404 });
  const installationId = installs[0].id;
  const octo = await getFirstInstallationOctokit();
  const data = await octo.request("GET /installation/repositories");
  return NextResponse.json({ installationId, repositories: data.data.repositories?.map((r: any) => r.full_name) });
}
