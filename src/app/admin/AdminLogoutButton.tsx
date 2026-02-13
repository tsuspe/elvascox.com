"use client";

export default function AdminLogoutButton({ className }: { className?: string }) {
  return (
    <form action="/admin/logout" method="post">
      <button
        type="submit"
        className={
          className ??
          "rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500 transition"
        }
      >
        Logout
      </button>
    </form>
  );
}
