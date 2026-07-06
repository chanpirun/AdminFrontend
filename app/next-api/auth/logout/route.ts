import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookie, clearAuthCookies } from "@/lib/auth-cookie";

export async function POST(request: NextRequest) {
  const token = await getTokenFromCookie();
  const backendBaseUrl =
    process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000";

  if (token) {
    try {
      await fetch(`${backendBaseUrl}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
    } catch {
      // Ignore network errors during logout
    }
  }

  const response = NextResponse.json({ message: "Logged out" }, { status: 200 });
  clearAuthCookies(response);
  return response;
}
