import { App } from "@octokit/app";
import { Octokit } from "@octokit/rest";

const APP_ID = process.env.GITHUB_APP_ID as string; // e.g. "123456"
const PRIVATE_KEY = (process.env.GITHUB_APP_PRIVATE_KEY || "").replace(/\n/g, "\n");
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET as string;

if (!APP_ID || !PRIVATE_KEY || !WEBHOOK_SECRET) {
  console.warn("[github.ts] Missing required env vars: GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY / GITHUB_WEBHOOK_SECRET");
}

export const webhookSecret = WEBHOOK_SECRET;

export const app = new App({
  appId: Number(APP_ID),
  privateKey: PRIVATE_KEY,
});

export async function getInstallationOctokit(installationId: number) {
  const token = await app.getInstallationAccessToken({ installationId });
  return new Octokit({ auth: token });
}

export async function getFirstInstallationOctokit() {
  // get app installations then pick the first (works for single-account installs)
  const jwt = await app.getSignedJsonWebToken();
  const octoAsApp = new Octokit({ auth: jwt, authStrategy: undefined as any });
  const installs: any = await fetch("https://api.github.com/app/installations", {
    headers: { Authorization: `Bearer ${jwt}`, Accept: "application/vnd.github+json" }
  }).then(r => r.json());

  if (!installs?.length) throw new Error("No installations found for this app");
  const installationId = installs[0].id;
  return getInstallationOctokit(installationId);
}
