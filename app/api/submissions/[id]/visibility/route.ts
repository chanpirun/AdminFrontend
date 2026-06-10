import { NextRequest, NextResponse } from "next/server";

function backendBaseUrl() {
  return process.env.BACKEND_API_BASE_URL ?? "http://127.0.0.1:8000";
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const authorization = request.headers.get("authorization") ?? "";
    const body = await request.json();

    const upstream = await fetch(
      `${backendBaseUrl()}/api/submissions/${id}/visibility`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: authorization,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

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
