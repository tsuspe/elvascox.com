// src/app/not-found.tsx
import { Suspense } from "react";
import NotFoundClient from "./NotFoundClient";

export const viewport = {
  colorScheme: "dark",
  themeColor: "#000000",
};

export default function NotFound() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-5 py-16 text-sm text-zinc-500">
          Cargando…
        </div>
      }
    >
      <NotFoundClient />
    </Suspense>
  );
}
