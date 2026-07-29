import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import type { ActivityItem } from "@/types";
import Loader from "../ui/loader";
export function LoginActivityLog() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [hasSuspicious, setHasSuspicious] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/user/login-activity", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        setHasSuspicious(Boolean(data.hasSuspiciousActivity));
      }
    } catch (err) {
      console.error("Failed to fetch login activity history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Security & Login Activity</CardTitle>
        <CardDescription>
          Audit history of account authentication attempts and suspicious security alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {hasSuspicious && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3">
            <div className="flex flex-col gap-0.5 text-xs">
              <span className="font-bold text-sm">Suspicious Login Activity Detected</span>
              <p>
                We noticed login attempts from a new IP address or unfamiliar browser/device. If this wasn&apos;t you, please revoke active sessions immediately.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <Loader />) : activities.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#594F4F]">No login activity recorded yet.</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E2D9] text-[#594F4F] uppercase tracking-wider font-semibold">
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 px-4">Timestamp</th>
                  <th className="pb-3 px-4">IP Address</th>
                  <th className="pb-3 pl-4">Details / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]/60">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-[#FBF9F6]/80 transition-colors">
                    <td className="py-3 pr-4">
                      {act.status === "SUSPICIOUS" ? (
                        <span className="px-2 py-0.5 font-bold bg-amber-100 text-amber-900 rounded-md">
                          SUSPICIOUS
                        </span>
                      ) : act.status === "FAILED" ? (
                        <span className="px-2 py-0.5 font-bold bg-red-100 text-red-800 rounded-md">
                          FAILED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 font-bold bg-emerald-100 text-emerald-800 rounded-md">
                          ✓ SUCCESS
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#554236] whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[#554236] font-mono whitespace-nowrap">
                      {act.ipAddress || "unknown"}
                    </td>
                    <td className="py-3 pl-4 text-[#594F4F] truncate max-w-xs">
                      {act.reason || "Standard Login"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
