"use client";
import { Clock, Copy, Share2, Trash2, FileText } from "lucide-react";
interface Document {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
interface DocumentCardProps {
  doc: Document;
  currentUserId: string;
  onClick: () => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
}
function formatDate(dateString: string): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DocumentCard({
  doc,
  currentUserId,
  onClick,
  onDuplicate,
  onDelete,
  onShare,
}: DocumentCardProps) {
  const isOwner = doc.ownerId === currentUserId;

  return (
    <div
      onClick={onClick}
      className="group bg-white border border-brand-border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-color-primary transition-all flex flex-col h-64 relative"
    >
      {/* Preview area */}
      <div className="h-36 bg-gradient-to-br from-indigo-50/50 via-white to-gray-50 border-b border-brand-border p-4 overflow-hidden relative flex flex-col justify-between">
        <div className="flex justify-between items-center z-10">
          <div className="p-2 bg-white rounded-lg shadow-xs border border-gray-100 text-color-primary">
            <FileText size={20} />
          </div>
          {isOwner ? (
            <span className="text-[11px] font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              Owner
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
              Shared with me
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 font-mono leading-relaxed line-clamp-2 select-none">
          {doc.title}
        </p>
      </div>

      {/* Meta */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div className="flex justify-between items-start gap-2">
          <h3
            className="font-semibold text-color-text-main truncate flex-1 text-base group-hover:text-color-primary transition-colors"
            title={doc.title}
          >
            {doc.title}
          </h3>

          <div className="flex items-center gap-1">
            {onShare && isOwner && (
              <button
                onClick={onShare}
                className="text-gray-400 hover:text-color-primary hover:bg-gray-100 transition-colors p-1.5 rounded-md"
                title="Share Document"
              >
                <Share2 size={16} />
              </button>
            )}
            <button
              onClick={onDuplicate}
              className="text-gray-400 hover:text-color-primary hover:bg-gray-100 transition-colors p-1.5 rounded-md"
              title="Duplicate"
            >
              <Copy size={16} />
            </button>
            {isOwner && (
              <button
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-1.5 rounded-md"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-color-text-muted mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Updated {formatDate(doc.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

