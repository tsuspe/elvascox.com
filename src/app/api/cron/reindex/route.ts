// src/app/api/cron/reindex/route.ts
import { reindexSitePages } from "@/lib/siteIndexReindex";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const auth = String(req.headers.get("authorization") ?? "");
  const token =
    auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  const alt = String(req.headers.get("x-cron-secret") ?? "").trim();
  const secret = String(process.env.CRON_SECRET ?? "").trim();

  if (!secret) return false;
  return token === secret || alt === secret;
}


export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const count = await reindexSitePages();
  return NextResponse.json({ ok: true, count });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
