export interface ActivityItem {
    id: string;
    email: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    status: "SUCCESS" | "FAILED" | "SUSPICIOUS";
    reason?: string | null;
    createdAt: string;
}
export interface SessionItem {
    id: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: string;
    expiresAt: string;
    isCurrent?: boolean;
}