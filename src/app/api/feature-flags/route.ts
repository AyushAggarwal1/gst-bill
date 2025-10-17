import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";

interface SessionUser {
  id: string;
  tenantId: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as unknown as SessionUser | undefined;
  if (!user?.tenantId) {
    return NextResponse.json([], { status: 200 });
  }

  const baseUrl = process.env.FLAGS_SERVICE_URL;
  if (!baseUrl) {
    return NextResponse.json([], { status: 200 });
  }

  const res = await fetch(`${baseUrl}/api/tenants/${user.tenantId}/features`, {
    // Optionally, forward auth headers if you secure the flags service
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json([], { status: 200 });
  }
  const data = await res.json();
  return NextResponse.json(data);
}

