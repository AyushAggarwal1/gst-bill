import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { renderConfig } from "@/lib/renderConfig";

// Get admin emails from configuration
const ADMIN_EMAILS = renderConfig.adminEmails;

/**
 * API route for downloading auth logs in various formats
 * @param req NextRequest
 * @returns NextResponse
 */
export async function GET(req: NextRequest) {
  // Authenticate user
  const session = await getServerSession();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json(
      { error: "Unauthorized. Admin access required." },
      { status: 401 }
    );
  }

  try {
    // Get format from query params (default: json)
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get("format") || "json";
    const days = parseInt(searchParams.get("days") || "7", 10);
    
    // Get logs from the database
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const logs = await prisma.authLog.findMany({
      where: {
        timestamp: {
          gte: startDate
        }
      },
      orderBy: {
        timestamp: "desc"
      }
    });

    // Return logs in requested format
    switch (format.toLowerCase()) {
      case "csv":
        // Generate CSV
        const csvHeader = "Timestamp,Event,Email,Details\n";
        const csvRows = logs.map((log: any) => 
          `"${log.timestamp.toISOString()}","${log.event}","${log.email}","${log.details || ""}"`
        ).join("\n");
        const csv = csvHeader + csvRows;
        
        // Return CSV with appropriate headers
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="auth-logs-${new Date().toISOString().split("T")[0]}.csv"`
          }
        });
        
      case "json":
      default:
        // Return JSON
        return NextResponse.json({
          logs,
          total: logs.length,
          format: "json",
          period: `Last ${days} days`
        });
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to retrieve logs" },
      { status: 500 }
    );
  }
} 