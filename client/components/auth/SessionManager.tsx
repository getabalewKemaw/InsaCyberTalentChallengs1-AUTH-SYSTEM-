import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import type { SessionItem } from "../../types/index.ts";
import Loader from "../ui/loader";
export function SessionManager() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [revokeOthersLoading, setRevokeOthersLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/user/sessions", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSingle = async (sessionId: string) => {
    setActionLoading(sessionId);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:5001/api/user/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Session revoked successfully." });
        await fetchSessions();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to revoke session." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Network error when revoking session." });
    } finally {
      setActionLoading(null);
    }
  };
  const handleRevokeOthers = async () => {
    setRevokeOthersLoading(true);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:5001/api/user/sessions/revoke-others", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        setMessage({ type: "success", text: "All other sessions revoked successfully." });
        await fetchSessions();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to revoke other sessions." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Network error when revoking sessions." });
    } finally {
      setRevokeOthersLoading(false);
    }
  };

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>View and manage all devices currently signed into your account</CardDescription>
        </div>
        {otherSessionsCount > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleRevokeOthers}
            isLoading={revokeOthersLoading}
          >
            Revoke All Other Sessions ({otherSessionsCount})
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {message && (
          <div
            className={`p-3 rounded-lg text-xs font-medium ${message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
              }`}
          >
            {message.text}
          </div>
        )}
        {loading ? (
          <Loader />)
          : sessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#594F4F]">No active sessions found.</div>
          ) : (
            <div className="divide-y divide-[#E8E2D9]">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#554236]">
                        {sess.userAgent ? sess.userAgent.split(" ")[0] || "Browser/Device" : "Unknown Device"}
                      </span>
                      {sess.isCurrent ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#BFB35A] text-[#554236] rounded-full uppercase tracking-wider">
                          Current Session
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#594F4F] flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>IP: <strong className="text-[#554236]">{sess.ipAddress || "Unknown"}</strong></span>
                      <span>•</span>
                      <span>Created: {new Date(sess.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      onClick={() => handleRevokeSingle(sess.id)}
                      isLoading={actionLoading === sess.id}
                    >
                      Revoke Session
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
