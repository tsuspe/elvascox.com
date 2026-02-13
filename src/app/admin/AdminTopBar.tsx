import Link from "next/link";
import AdminLogoutButton from "./AdminLogoutButton";

export default function AdminTopBar() {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin" className="text-sm text-zinc-300 hover:text-white transition">
          Admin
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-700">/</span>

        <Link href="/admin/works" className="text-sm text-zinc-300 hover:text-white transition">
          Works
        </Link>
        <span className="text-zinc-700">/</span>
        
        <Link href="/admin/works/new" className="text-sm text-zinc-300 hover:text-white transition">
          New Work
        </Link>
      </div>

      <AdminLogoutButton />
    </div>
  );
}
