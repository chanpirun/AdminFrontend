import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookie";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendBaseUrl =
      process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000";

    const upstream = await fetch(`${backendBaseUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (!isJson) {
      return NextResponse.json(
        { message: "Invalid response from backend auth service." },
        { status: 502 }
      );
    }

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { message: data.message ?? "Invalid credentials" },
        { status: upstream.status }
      );
    }

    const { token, user } = data;

    // Validate that the user role is authorized for the admin portal
    if (user.role !== "director" && user.role !== "assistant") {
      return NextResponse.json(
        { message: "Unauthorized. Admin portal access is restricted." },
        { status: 403 }
      );
    }

    const response = NextResponse.json(
      { user },
      { status: 200 }
    );

    setAuthCookies(response, token, user);

    return response;
  } catch {
    return NextResponse.json(
      { message: "Unable to reach backend authentication service." },
      { status: 502 }
    );
  }
}
