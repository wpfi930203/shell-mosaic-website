import { NextResponse } from "next/server";

import { readSiteData, writeSiteData } from "@/lib/data-store";
import type { SiteData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteData = await readSiteData();
  return NextResponse.json(siteData);
}

export async function PATCH(request: Request) {
  const nextData = (await request.json()) as SiteData;
  await writeSiteData(nextData);
  return NextResponse.json(nextData);
}
