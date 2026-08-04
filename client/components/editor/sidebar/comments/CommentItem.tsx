"use client";

import { Check, Trash2 } from "lucide-react";
import { formatDateTime } from "@/utils/date.utils";
import type { Comment } from "@/types/comment.types";
import type { UserSessionInfo } from "@/types/editor.types";
import type { PermissionLevel } from "@/types/document.types";

interface CommentItemProps {
  comment: Comment;
  currentUser: UserSessionInfo;
  userPermission?: PermissionLevel;
  resolveComment: (id: string) => void;
  deleteComment: (id: string) => void;
}

export default function CommentItem({
  comment,
  currentUser,
  userPermission,
  resolveComment,
  deleteComment,
}: CommentItemProps) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        comment.resolved ? "bg-gray-50 border-gray-200" : "bg-white border-brand-border shadow-sm"
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-color-text-main">
            {comment.user?.name ?? currentUser.name ?? "Unknown"}
          </span>
          {comment.user?.email && (
            <span className="text-[10px] text-color-text-light">{comment.user.email}</span>
          )}
        </div>
        <span className="text-xs text-color-text-light">{formatDateTime(comment.createdAt)}</span>
      </div>
      <p className={`text-sm mb-3 ${comment.resolved ? "text-gray-500 line-through" : "text-color-text-main"}`}>
        {comment.content}
      </p>

      {!comment.resolved && (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => resolveComment(comment.id)}
            className="text-xs flex items-center gap-1 text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors"
          >
            <Check size={14} /> Resolve
          </button>
          {(comment.userId === currentUser.id || userPermission === "owner") && (
            <button
              onClick={() => deleteComment(comment.id)}
              className="text-xs flex items-center gap-1 text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
