"use client";

import { Eye, MessageSquare } from "lucide-react";

interface ReadOnlyBannerProps {
  userPermission?: string;
}

export default function ReadOnlyBanner({ userPermission }: ReadOnlyBannerProps) {
  return (
    <div className="flex items-center justify-between px-6 py-2.5 bg-amber-50/80 border-b border-amber-200/60 text-amber-900 text-xs font-semibold">
      <span className="flex items-center gap-2">
        {userPermission === "commenter" ? (
          <>
            <MessageSquare size={15} className="text-amber-700" />
            <span>Commenter mode — Text editing disabled, comment creation active in sidebar</span>
          </>
        ) : (
          <>
            <Eye size={15} className="text-amber-700" />
            <span>Read-only mode (Viewing permission)</span>
          </>
        )}
      </span>
      <span className="text-amber-700/80 font-normal">Text editing disabled</span>
    </div>
  );
}
