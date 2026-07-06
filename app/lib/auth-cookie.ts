import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const AUTH_TOKEN_COOKIE = "radice_admin_auth_token";
export const AUTH_USER_COOKIE  = "radice_admin_auth_user";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   false,
  sameSite: "lax" as const,
  path:     "/",
  maxAge:   60 * 60 * 24, // 24 hours
};

export const USER_COOKIE_OPTIONS = {
  httpOnly: false, // readable by client-side JS
  secure:   false,
  sameSite: "lax" as const,
  path:     "/",
  maxAge:   60 * 60 * 24,
};

export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

export function setAuthCookies(
  response: NextResponse,
  token: string,
  user: { id: number; name: string; email: string; role: string }
): void {
  response.cookies.set(AUTH_TOKEN_COOKIE, token, AUTH_COOKIE_OPTIONS);
  response.cookies.set(AUTH_USER_COOKIE, JSON.stringify(user), USER_COOKIE_OPTIONS);
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(AUTH_TOKEN_COOKIE, "", { ...AUTH_COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set(AUTH_USER_COOKIE,  "", { ...USER_COOKIE_OPTIONS, maxAge: 0 });
}
