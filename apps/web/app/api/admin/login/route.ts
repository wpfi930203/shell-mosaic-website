import { NextResponse } from "next/server";

import { ADMIN_COOKIE, requireAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email: string; password: string };
  const valid = await requireAdminCredentials(body.email, body.password);

  if (!valid) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, "authenticated", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
