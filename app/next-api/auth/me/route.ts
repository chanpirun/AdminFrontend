import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCookie, AUTH_USER_COOKIE } from "@/lib/auth-cookie";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const token = await getTokenFromCookie();

  if (!token) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const cookieStore = await cookies();
  const userRaw = cookieStore.get(AUTH_USER_COOKIE)?.value;

  if (!userRaw) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  try {
    const user = JSON.parse(userRaw);
    return NextResponse.json({ user }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }
}
