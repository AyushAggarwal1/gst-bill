"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { renderConfig } from "@/lib/renderConfig";

// Get admin emails from configuration
const ADMIN_EMAILS = renderConfig.adminEmails;

// Interfaces
interface LogEntry {
  id: string;
  timestamp: string;
  event: string;
  email: string;
  details: string | null;
  createdAt: string;
}

interface LogsResponse {
  logs: LogEntry[];
  total: number;
  format: string;
  period: string;
}

export default function AdminLogsPage() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState("7");
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check if user is authorized
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.email && ADMIN_EMAILS.includes(session.user.email)) {
        setIsAuthorized(true);
        fetchLogs();
      } else {
        setIsAuthorized(false);
        setError("You do not have permission to access this page.");
      }
    } else if (status === "unauthenticated") {
      setIsAuthorized(false);
      setError("You must be logged in to access this page.");
    }
  }, [status, session, days]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/logs/download?days=${days}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }
      
      const data: LogsResponse = await response.json();
      setLogs(data.logs);
      setError("");
    } catch (error) {
      console.error("Error fetching logs:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format: string) => {
    window.open(`/api/admin/logs/download?format=${format}&days=${days}`, '_blank');
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy HH:mm:ss");
    } catch (error) {
      return dateStr;
    }
  };

  // Get appropriate color for event type
  const getEventColor = (event: string) => {
    switch (event) {
      case "LOGIN":
        return "text-green-600";
      case "LOGOUT":
        return "text-blue-600";
      case "LOGIN_FAILED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          {error || "You do not have permission to view this page."}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Log Viewer</h1>
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">
              Days:
              <select
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="ml-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </select>
            </label>
            <div className="ml-4 flex items-center space-x-2">
              <button
                onClick={() => handleDownload("json")}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
              >
                JSON
              </button>
              <button
                onClick={() => handleDownload("csv")}
                className="px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
              >
                CSV
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden border-b border-gray-200 rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              <span className="ml-2 text-gray-500">Loading logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No logs found for the selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Event
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${
                            log.event === "LOGIN"
                              ? "bg-green-100 text-green-800"
                              : log.event === "LOGOUT"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {log.event}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.details || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>
            Note: This page is only accessible to administrators. Log data is also available in
            the Render dashboard under the Logs tab for your service.
          </p>
        </div>
      </div>
    </div>
  );
} 