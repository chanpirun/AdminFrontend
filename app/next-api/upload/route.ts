import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookie } from "@/lib/auth-cookie";

function backendBaseUrl() {
  return process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000";
}

export async function POST(request: NextRequest) {
  try {
    const token = await getTokenFromCookie();
    if (!token) return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });

    const incomingFormData = await request.formData();
    const outgoingFormData = new FormData();

    incomingFormData.forEach((value, key) => {
      outgoingFormData.append(key, value);
    });

    const upstream = await fetch(`${backendBaseUrl()}/api/upload`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        // Note: Let fetch set the correct multipart/form-data Content-Type header with its boundary
      },
      body: outgoingFormData,
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await upstream.json()
      : { message: await upstream.text() };
    return NextResponse.json(body, { status: upstream.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { message: "Unable to reach backend upload service." },
      { status: 502 },
    );
  }
}
