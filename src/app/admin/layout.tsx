//src/app/admin/layout.tsx
import AdminTopBar from "./AdminTopBar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AdminTopBar />
      <main className="mx-auto max-w-4xl px-6 py-6">{children}</main>
    </div>
  );
}
