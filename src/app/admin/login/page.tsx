import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "").trim();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    redirect("/admin/login?err=invalid");
  }

  // ✅ Next 16: cookies() puede venir como Promise -> hay que await
  const cookieStore = await cookies();
  cookieStore.set("admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });


  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const { err } = await searchParams;

  return (
    <section className="mx-auto max-w-sm space-y-6 pt-24">
      <h1 className="text-center text-2xl font-semibold">Admin login</h1>

      {err === "invalid" ? (
        <div className="rounded-lg border border-red-700 p-3 text-sm text-red-300">
          Password incorrecta
        </div>
      ) : null}

      <form action={login} className="space-y-4">
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm"
        />

        <button className="w-full rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition">
          Entrar
        </button>
      </form>
    </section>
  );
}
