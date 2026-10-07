import { cookies } from "next/headers";

const ADMIN_COOKIE = "lansic_admin_session";
const ADMIN_EMAIL = "admin@lansictiles.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "LansicAdmin123!";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "authenticated";
}

export async function requireAdminCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export { ADMIN_COOKIE, ADMIN_EMAIL };
