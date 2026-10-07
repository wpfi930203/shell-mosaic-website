"use client";

import { useId, useState } from "react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  helperText,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const [status, setStatus] = useState("");

  async function upload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    setStatus("Uploading...");

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setStatus("Upload failed.");
      return;
    }

    const payload = (await response.json()) as { path: string };
    onChange(payload.path);
    setStatus("Uploaded.");
  }

  return (
    <div className="space-y-3 rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">{label}</p>
          {helperText ? <p className="text-xs text-stone-500">{helperText}</p> : null}
        </div>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="min-h-11 rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700"
          >
            Remove
          </button>
        ) : null}
      </div>

      {value ? (
        <div className="overflow-hidden rounded-[20px] border border-stone-200 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="h-44 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center rounded-[20px] border border-stone-200 bg-white text-sm text-stone-400">
          No image selected
        </div>
      )}

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm"
        placeholder="/uploads/your-file.jpg"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Upload Image
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }

            void upload(file);
            event.target.value = "";
          }}
        />
        {status ? <p className="text-xs text-stone-500">{status}</p> : null}
      </div>
    </div>
  );
}
