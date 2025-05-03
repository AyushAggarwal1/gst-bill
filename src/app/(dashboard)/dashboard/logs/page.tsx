"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

type LogEntry = {
  timestamp: string;
  event: string;
  email: string;
  details: string;
};

type LogStats = {
  total: number;
  login: number;
  logout: number;
  failed: number;
};

export default function LogsPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats>({ total: 0, login: 0, logout: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, login, logout, failed

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/logs/auth");
        
        if (!res.ok) {
          throw new Error("Failed to fetch logs");
        }
        
        const data = await res.json();
        setLogs(data.logs);
        setStats(data.stats);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch logs");
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, []);

  // Filter logs based on selected filter
  const filteredLogs = logs.filter(log => {
    if (filter === "all") return true;
    if (filter === "login") return log.event === "LOGIN";
    if (filter === "logout") return log.event === "LOGOUT";
    if (filter === "failed") return log.event === "LOGIN_FAILED";
    return true;
  });

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy HH:mm:ss");
    } catch (error) {
      return timestamp;
    }
  };

  // Get event badge color
  const getEventBadgeColor = (event: string) => {
    switch (event) {
      case "LOGIN":
        return "bg-green-100 text-green-800";
      case "LOGOUT":
        return "bg-blue-100 text-blue-800";
      case "LOGIN_FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Authentication Logs</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats section */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Successful Logins</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.login}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Logouts</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats.logout}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Failed Attempts</dt>
                <dd className="mt-1 text-3xl font-semibold text-red-600">{stats.failed}</dd>
              </div>
            </div>
          </div>

          {/* Filter controls */}
          <div className="bg-white shadow px-4 py-3 sm:px-6 mb-6 rounded-lg flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-3">Filter:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === "all"
                    ? "bg-indigo-100 text-indigo-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("login")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === "login"
                    ? "bg-green-100 text-green-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Logins
              </button>
              <button
                onClick={() => setFilter("logout")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === "logout"
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Logouts
              </button>
              <button
                onClick={() => setFilter("failed")}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  filter === "failed"
                    ? "bg-red-100 text-red-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Failed Attempts
              </button>
            </div>
          </div>

          {/* Logs table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {loading ? (
              <div className="px-4 py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                <p className="text-gray-500">Loading logs...</p>
              </div>
            ) : error ? (
              <div className="px-4 py-6 text-center text-red-600">{error}</div>
            ) : filteredLogs.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                No logs found. {filter !== "all" && "Try changing the filter."}
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
                    {filteredLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventBadgeColor(
                              log.event
                            )}`}
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
        </div>
      </div>
    </div>
  );
} 