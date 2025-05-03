import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { getAuthLogs } from "@/lib/logger";

export async function GET(req: Request) {
  // Check if user is authenticated and authorized
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    // Get logs
    const logs = getAuthLogs(100); // Get last 100 logs
    
    return NextResponse.json({
      logs,
    });
  } catch (error) {
    console.error("Error fetching auth logs:", error);
    return NextResponse.json(
      { message: "Failed to fetch authentication logs" },
      { status: 500 }
    );
  }
} 