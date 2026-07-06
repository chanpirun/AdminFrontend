import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookie } from "@/lib/auth-cookie";

function backendBaseUrl() {
  return process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000";
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const token = await getTokenFromCookie();
    if (!token) return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });

    const upstream = await fetch(`${backendBaseUrl()}/api/submissions/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await upstream.json()
      : { message: await upstream.text() };
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach backend submissions service." },
      { status: 502 },
    );
  }
}
