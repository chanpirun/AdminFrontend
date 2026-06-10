import { NextRequest, NextResponse } from "next/server";

function backendBaseUrl() {
  return process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000";
}

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const upstream = await fetch(`${backendBaseUrl()}/api/submissions`, {
      headers: {
        Accept: "application/json",
        Authorization: authorization,
      },
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await upstream.json()
      : { message: await upstream.text() };
    return NextResponse.json(body, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach backend submissions service." },
      { status: 502 },
    );
  }
}
