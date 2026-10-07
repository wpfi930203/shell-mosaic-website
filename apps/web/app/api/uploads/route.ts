import { randomUUID } from "node:crypto";
import path from "node:path";
import { writeFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { ensureUploadsDir } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No file uploaded." }, { status: 400 });
  }

  const uploadsDir = await ensureUploadsDir();
  const extension = path.extname(file.name) || ".bin";
  const filename = `${randomUUID()}${extension}`;
  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);

  return NextResponse.json({ path: `/uploads/${filename}` }, { status: 201 });
}
