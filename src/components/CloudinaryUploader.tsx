"use client";

import * as React from "react";

type Props = {
  label?: string;
  onUploaded: (url: string) => void;
  accept?: string;
};

export default function CloudinaryUploader({
  label = "Subir imagen",
  onUploaded,
  accept = "image/*",
}: Props) {
  const [uploading, setUploading] = React.useState(false);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!cloudName) {
      alert("Falta NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en .env");
      return;
    }
    if (!uploadPreset) {
      alert("Falta NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", uploadPreset);

      // opcional: fuerza folder desde aquí (aunque ya lo hagas en el preset)
      // form.append("folder", "elvasco/works");

      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: form,
      });

      if (!upRes.ok) throw new Error("Upload falló");
      const data = await upRes.json();

      onUploaded(data.secure_url);
    } catch (err: any) {
      alert(err?.message ?? "Error subiendo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-600 transition cursor-pointer">
      <input type="file" accept={accept} className="hidden" onChange={onPickFile} />
      {uploading ? "Subiendo..." : label}
    </label>
  );
}
