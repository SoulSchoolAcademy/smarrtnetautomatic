import { NextRequest, NextResponse } from "next/server";
import { getFirstInstallationOctokit } from "@/lib/github";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { owner, repo, workflow, ref = "main", inputs = {} } = await req.json();
  if (!owner || !repo || !workflow) return NextResponse.json({ error: "owner, repo, workflow required" }, { status: 400 });

  const octo = await getFirstInstallationOctokit();
  await octo.request("POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches", {
    owner,
    repo,
    workflow_id: workflow,
    ref,
    inputs
  });
  return NextResponse.json({ ok: true });
}
