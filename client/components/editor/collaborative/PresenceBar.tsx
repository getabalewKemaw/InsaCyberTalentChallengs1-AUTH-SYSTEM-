"use client";
import type { AwarenessUser } from "@/types/editor.types";
interface PresenceBarProps {
  collaborators: AwarenessUser[];
}
export default function PresenceBar({ collaborators }: PresenceBarProps) {
  if (collaborators.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-blue-50/80 border-t border-blue-100/60 flex-wrap">
      <span className="text-xs text-blue-700 font-semibold mr-1 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block"></span>
        Also editing:
      </span>
      {collaborators.map((c, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-xs"
          style={{ backgroundColor: c.color }}
          title={c.name}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80 inline-block" />
          {c.name}
        </div>
      ))}
    </div>
  );
}
