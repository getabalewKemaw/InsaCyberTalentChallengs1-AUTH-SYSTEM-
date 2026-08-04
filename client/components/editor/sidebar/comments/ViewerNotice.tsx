"use client";

import { AlertCircle } from "lucide-react";

interface ViewerNoticeProps {
  message: string;
}

export default function ViewerNotice({ message }: ViewerNoticeProps) {
  return (
    <div className="p-4 border-t border-brand-border bg-amber-50 text-amber-900 text-xs flex items-center gap-2 font-medium">
      <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
