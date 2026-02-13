import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const cookieStore = await cookies();

  cookieStore.set("admin", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  // Redirigir al login (misma origin)
  const url = new URL("/admin/login", req.url);
  return NextResponse.redirect(url, 303);
}
