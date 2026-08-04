"use client";

import type { Comment } from "@/types/comment.types";
import type { UserSessionInfo } from "@/types/editor.types";
import type { PermissionLevel } from "@/types/document.types";
import CommentItem from "./CommentItem";

interface CommentListProps {
  comments: Comment[];
  currentUser: UserSessionInfo;
  userPermission?: PermissionLevel;
  resolveComment: (id: string) => void;
  deleteComment: (id: string) => void;
}

export default function CommentList({
  comments,
  currentUser,
  userPermission,
  resolveComment,
  deleteComment,
}: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-center text-color-text-muted mt-10">No comments yet.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUser={currentUser}
          userPermission={userPermission}
          resolveComment={resolveComment}
          deleteComment={deleteComment}
        />
      ))}
    </div>
  );
}
