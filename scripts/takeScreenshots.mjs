#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const PORT = Number(process.env.SCREENSHOTS_PORT ?? 3100);
const LOCAL_BASE_URL = `http://127.0.0.1:${PORT}`;
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "docs", "images");
const DEFAULT_DB_URL =
  "postgresql://postgres:postgres@127.0.0.1:5432/elvascox?schema=public";

// Required validation by spec.
const baseUrl = process.env.SCREENSHOT_BASE_URL?.replace(/\/$/, "");

const desktopViewport = { width: 1440, height: 900 };
const mobileViewport = { width: 390, height: 844 };

const SHOTS = [
  { route: "/", file: "home-desktop.png", viewport: desktopViewport },
  { route: "/work", file: "work-desktop.png", viewport: desktopViewport },
  { route: "/tattoo", file: "tattoo-desktop.png", viewport: desktopViewport },
  { route: "/musica", file: "musica-desktop.png", viewport: desktopViewport },
  { route: "/film", file: "film-desktop.png", viewport: desktopViewport },
  { route: "/journal", file: "journal-desktop.png", viewport: desktopViewport },
  { route: "/bio", file: "bio-desktop.png", viewport: desktopViewport },
  { route: "/", file: "home-mobile.png", viewport: mobileViewport },
  { route: "/work", file: "work-mobile.png", viewport: mobileViewport },
];

function log(msg) {
  process.stdout.write(`[screenshots] ${msg}\n`);
}

function cmdForNpm() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function withEnv(base = process.env) {
  return {
    ...base,
    NODE_ENV: "production",
    NEXT_PUBLIC_SITE_URL: base.NEXT_PUBLIC_SITE_URL || LOCAL_BASE_URL,
    SITE_URL: base.SITE_URL || LOCAL_BASE_URL,
    ADMIN_PASSWORD: base.ADMIN_PASSWORD || "dummy",
    CRON_SECRET: base.CRON_SECRET || "dummy",
    SPECIAL_BLACKOUT_HREF: base.SPECIAL_BLACKOUT_HREF || "/tattoo/blackout",
    CLOUDINARY_CLOUD_NAME: base.CLOUDINARY_CLOUD_NAME || "dummy",
    CLOUDINARY_API_KEY: base.CLOUDINARY_API_KEY || "dummy",
    CLOUDINARY_API_SECRET: base.CLOUDINARY_API_SECRET || "dummy",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      base.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dummy",
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
      base.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "dummy",
    OPENROUTER_API_KEY: base.OPENROUTER_API_KEY || "dummy",
    OPENROUTER_MODEL: base.OPENROUTER_MODEL || "openai/gpt-4o-mini",
    OPENROUTER_SITE_URL: base.OPENROUTER_SITE_URL || LOCAL_BASE_URL,
    OPENROUTER_APP_NAME: base.OPENROUTER_APP_NAME || "elvascox-screenshots",
    OLLAMA_BASE_URL: base.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
    OLLAMA_MODEL: base.OLLAMA_MODEL || "llama3.1:8b",
    DATABASE_URL:
      base.DATABASE_URL ||
      DEFAULT_DB_URL,
    DIRECT_URL:
      base.DIRECT_URL ||
      DEFAULT_DB_URL,
  };
}

function resolveBaseUrl() {
  if (!baseUrl) return LOCAL_BASE_URL;

  if (!/^https?:\/\//i.test(baseUrl)) {
    throw new Error(
      "SCREENSHOT_BASE_URL must start with http:// or https://"
    );
  }

  return baseUrl;
}

function run(cmd, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: ROOT,
      env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`${cmd} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

async function waitForReady(url, timeoutMs = 120000) {
  const start = Date.now();
  let lastErr = "";

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
      lastErr = `status ${res.status}`;
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error(`Timeout waiting for ${url}. Last error: ${lastErr}`);
}

async function startServer(env) {
  const child = spawn(cmdForNpm(), ["run", "start", "--", "-p", String(PORT)], {
    cwd: ROOT,
    env,
    stdio: "inherit",
    detached: process.platform !== "win32",
  });

  child.on("error", (err) => {
    log(`Server process error: ${err.message}`);
  });

  await waitForReady(`${LOCAL_BASE_URL}/api/public/meta`);
  await waitForReady(`${LOCAL_BASE_URL}/api/public/works?page=1&pageSize=1`);

  return child;
}

async function stopServer(child) {
  if (!child) return;

  if (process.platform === "win32") {
    try {
      process.kill(child.pid);
    } catch {}
    return;
  }

  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {}
}

async function captureShots(targetBaseUrl) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    for (const shot of SHOTS) {
      const context = await browser.newContext({ viewport: shot.viewport });
      const page = await context.newPage();
      const url = `${targetBaseUrl}${shot.route}`;

      log(`Capturing ${url} -> docs/images/${shot.file}`);
      await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
      await page.screenshot({
        path: path.join(OUT_DIR, shot.file),
        fullPage: true,
      });

      await context.close();
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const env = withEnv(process.env);
  const targetBaseUrl = resolveBaseUrl();
  const externalMode = Boolean(baseUrl);
  let server;

  try {
    await fs.mkdir(OUT_DIR, { recursive: true });

    if (externalMode) {
      log(`External mode enabled. Using SCREENSHOT_BASE_URL=${targetBaseUrl}`);
      await waitForReady(`${targetBaseUrl}/`);
    } else {
      log("Autonomous mode enabled.");

      log("Running prisma migrate deploy...");
      await run("npx", ["prisma", "migrate", "deploy"], env);

      log("Running seed...");
      await run(cmdForNpm(), ["run", "seed"], env);

      log("Building Next.js app...");
      await run(cmdForNpm(), ["run", "build"], env);

      log(`Starting Next.js on ${LOCAL_BASE_URL}...`);
      server = await startServer(env);
    }

    log("Taking screenshots...");
    await captureShots(targetBaseUrl);

    log("Done.");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`ERROR: ${msg}`);
    log(
      "Tip: ensure PostgreSQL is reachable and DATABASE_URL/DIRECT_URL are valid. " +
        `Default fallback expects ${DEFAULT_DB_URL}`
    );
    process.exitCode = 1;
  } finally {
    await stopServer(server);
  }
}

main();
