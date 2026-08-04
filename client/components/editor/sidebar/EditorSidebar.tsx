"use client";

import { useState } from "react";
import Loader from "@/components/ui/loader";
import { useComments } from "@/hooks/useComments";
import { useRevisions } from "@/hooks/useRevisions";
import type { SidebarTab, UserSessionInfo } from "@/types/editor.types";
import type { PermissionLevel } from "@/types/document.types";

import SidebarHeader from "./SidebarHeader";
import CommentList from "./comments/CommentList";
import CommentForm from "./comments/CommentForm";
import ViewerNotice from "./comments/ViewerNotice";
import RevisionList from "./history/RevisionList";
import CommitForm from "./history/CommitForm";

interface EditorSidebarProps {
  documentId: string;
  activeTab: SidebarTab;
  onClose: () => void;
  currentUser: UserSessionInfo;
  userPermission?: PermissionLevel;
}

export default function EditorSidebar({
  documentId,
  activeTab,
  onClose,
  currentUser,
  userPermission,
}: EditorSidebarProps) {
  const [newCommentText, setNewCommentText] = useState("");
  const [commitMessage, setCommitMessage] = useState("");

  const isCommentsActive = activeTab === "comments";
  const isHistoryActive = activeTab === "history";

  const {
    comments,
    loading: commentsLoading,
    errorMessage,
    setErrorMessage,
    addComment,
    resolveComment,
    deleteComment,
  } = useComments(documentId, isCommentsActive);

  const {
    revisions,
    loading: revisionsLoading,
    savingRevision,
    createRevision,
    restoreRevision,
  } = useRevisions(documentId, isHistoryActive);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    await addComment(newCommentText);
    setNewCommentText("");
  };

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRevision(commitMessage.trim());
    setCommitMessage("");
  };

  if (!activeTab) return null;

  const loading = isCommentsActive ? commentsLoading : revisionsLoading;

  return (
    <div className="w-full md:w-80 bg-brand-surface border-l border-brand-border fixed md:static right-0 top-16 bottom-0 h-[calc(100vh-4rem)] md:h-full flex flex-col shadow-2xl md:shadow-lg z-40 transition-all">
      <SidebarHeader isCommentsActive={isCommentsActive} onClose={onClose} />

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-8"><Loader /></div>
        ) : isCommentsActive ? (
          <CommentList
            comments={comments}
            currentUser={currentUser}
            userPermission={userPermission}
            resolveComment={resolveComment}
            deleteComment={deleteComment}
          />
        ) : (
          <RevisionList
            revisions={revisions}
            restoreRevision={restoreRevision}
          />
        )}
      </div>

      {/* Footer input */}
      {isCommentsActive && (
        userPermission === "viewer" ? (
          <ViewerNotice message="Viewer mode: Comment creation is disabled. Ask the owner for Commenter access." />
        ) : (
          <CommentForm
            newCommentText={newCommentText}
            onChangeText={setNewCommentText}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
            onSubmitComment={handleAddComment}
          />
        )
      )}

      {isHistoryActive && (
        userPermission === "viewer" ? (
          <ViewerNotice message="Viewer mode: Manual saving is disabled. Ask the owner for Editor access." />
        ) : (
          <CommitForm
            commitMessage={commitMessage}
            onChangeMessage={setCommitMessage}
            savingRevision={savingRevision}
            onSubmitCommit={handleSaveVersion}
          />
        )
      )}
    </div>
  );
}
