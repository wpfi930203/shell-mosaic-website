import { NextResponse } from "next/server";

import { readSiteData, writeSiteData } from "@/lib/data-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name: string;
    email: string;
    phone: string;
    message: string;
    applicationScene: string;
    budgetRange: string;
    referenceImagePaths?: string[];
  };

  const siteData = await readSiteData();
  const inquiry = {
    id: `inq-${siteData.inquiries.length + 1}`,
    name: body.name,
    email: body.email,
    phone: body.phone,
    message: body.message,
    applicationScene: body.applicationScene,
    budgetRange: body.budgetRange,
    referenceImagePaths: body.referenceImagePaths ?? [],
    createdAt: new Date().toISOString(),
  };

  const nextData = {
    ...siteData,
    inquiries: [inquiry, ...siteData.inquiries],
  };

  await writeSiteData(nextData);

  return NextResponse.json(inquiry, { status: 201 });
}
