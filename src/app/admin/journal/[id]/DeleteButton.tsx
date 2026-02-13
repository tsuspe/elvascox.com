"use client";

import * as React from "react";

export default function DeleteButton({
  children,
  className,
  formAction,
  confirmText = "¿Borrar este Journal? (acción irreversible)",
}: {
  children: React.ReactNode;
  className?: string;
  formAction: (formData: FormData) => void;
  confirmText?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      formAction={formAction}
      onClick={(e) => {
        if (!confirm(confirmText)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
