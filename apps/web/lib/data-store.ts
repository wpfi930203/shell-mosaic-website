import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { normalizeSiteData } from "@/lib/site-data-normalizer";
import type { SiteData } from "@/lib/types";

const dataFile = path.join(process.cwd(), "data", "site-data.json");
const uploadsDir = path.join(process.cwd(), "public", "uploads");

export async function readSiteData(): Promise<SiteData> {
  const contents = await readFile(dataFile, "utf8");
  const siteData = normalizeSiteData(JSON.parse(contents) as SiteData);
  const normalizedContents = JSON.stringify(siteData, null, 2);

  if (normalizedContents !== contents) {
    await writeFile(dataFile, normalizedContents, "utf8");
  }

  return siteData;
}

export async function writeSiteData(nextData: SiteData): Promise<SiteData> {
  const normalizedData = normalizeSiteData(nextData);
  await writeFile(dataFile, JSON.stringify(normalizedData, null, 2), "utf8");
  return normalizedData;
}

export async function updateSiteData(
  updater: (current: SiteData) => SiteData,
): Promise<SiteData> {
  const current = await readSiteData();
  const next = updater(current);
  return writeSiteData(next);
}

export async function ensureUploadsDir(): Promise<string> {
  await mkdir(uploadsDir, { recursive: true });
  return uploadsDir;
}
