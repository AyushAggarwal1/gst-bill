import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import fs from "fs";
import path from "path";

// Define the log file path
const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "auth.log");

export async function GET() {
  // Check if user is authenticated
  const session = await getServerSession();

  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Check if log file exists
    if (!fs.existsSync(LOG_FILE)) {
      return NextResponse.json({ logs: [], stats: { total: 0, login: 0, logout: 0, failed: 0 } });
    }

    // Read logs
    const logsContent = fs.readFileSync(LOG_FILE, "utf8");
    const logLines = logsContent.split("\n").filter(line => line.trim());

    // Parse logs into structured format
    const logs = logLines.map(line => {
      const parts = line.split(" | ");
      return {
        timestamp: parts[0] || "",
        event: parts[1] || "",
        email: parts[2] || "",
        details: parts[3] || ""
      };
    });

    // Calculate statistics
    const loginCount = logs.filter(log => log.event === "LOGIN").length;
    const logoutCount = logs.filter(log => log.event === "LOGOUT").length;
    const failedCount = logs.filter(log => log.event === "LOGIN_FAILED").length;

    return NextResponse.json({
      logs,
      stats: {
        total: logs.length,
        login: loginCount,
        logout: logoutCount,
        failed: failedCount
      }
    });
  } catch (error) {
    console.error("Error reading auth logs:", error);
    return NextResponse.json(
      { error: "Failed to read authentication logs" },
      { status: 500 }
    );
  }
} 