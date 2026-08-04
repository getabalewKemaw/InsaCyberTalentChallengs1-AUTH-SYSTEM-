"use client";

import { formatDateTime } from "@/utils/date.utils";
import type { Revision } from "@/types/revision.types";

interface RevisionItemProps {
  rev: Revision;
  idx: number;
  revisionsLength: number;
  restoreRevision: (id: string) => void;
}

export default function RevisionItem({
  rev,
  idx,
  revisionsLength,
  restoreRevision,
}: RevisionItemProps) {
  return (
    <div
      className="p-3 bg-white border border-brand-border rounded-lg shadow-sm hover:border-color-primary cursor-pointer transition-colors group flex flex-col gap-1.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${rev.isAutoSave ? "bg-gray-400" : "bg-color-primary"}`}></div>
          <span className="font-semibold text-sm text-color-text-main">
            {rev.name ? rev.name : (idx === 0 ? "Current Version" : `Version ${revisionsLength - idx}`)}
          </span>
        </div>
        {!rev.isAutoSave && (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
            Commit
          </span>
        )}
      </div>

      {rev.user && (
        <div className="flex items-center gap-1.5 text-xs text-color-text-muted">
          <span className="font-medium text-color-text-main">{rev.user.name}</span>
          <span>•</span>
          <span>{rev.user.email}</span>
        </div>
      )}

      <div className="flex justify-between items-center mt-1">
        <span className="text-[11px] text-color-text-light">{formatDateTime(rev.createdAt)}</span>
        {idx !== 0 && (
          <button
            onClick={() => restoreRevision(rev.id)}
            className="text-xs font-medium text-color-primary hover:underline transition-colors"
          >
            Restore
          </button>
        )}
      </div>
    </div>
  );
}
