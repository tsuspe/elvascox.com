//src/app/admin/works/[id]/DeleteButton.tsx
"use client";

import * as React from "react";

export default function DeleteButton({
  children,
  className,
  formAction,
}: {
  children: React.ReactNode;
  className?: string;
  formAction: (formData: FormData) => void;
}) {
  return (
    <button
      type="submit"
      className={className}
      formAction={formAction}
      onClick={(e) => {
        if (!confirm("¿Borrar este Work? (se eliminará también media/tags/links)")) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
