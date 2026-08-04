"use client";

import { useState } from "react";
import { X, Send, Clock, MessageSquare, Check, Trash2, AlertCircle } from "lucide-react";
import Loader from "@/components/ui/loader";
import { useComments } from "@/hooks/useComments";
import { useRevisions } from "@/hooks/useRevisions";
import { formatDateTime } from "@/utils/date.utils";
import type { SidebarTab, UserSessionInfo } from "@/types/editor.types";
import type { PermissionLevel } from "@/types/document.types";

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

  const [commitMessage, setCommitMessage] = useState("");

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
    <div className="w-80 bg-brand-surface border-l border-brand-border h-full flex flex-col shadow-lg z-30 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-brand-border">
        <h3 className="font-bold text-color-text-main flex items-center gap-2">
          {isCommentsActive ? <MessageSquare size={18} /> : <Clock size={18} />}
          {isCommentsActive ? "Comments" : "Version History"}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-8"><Loader /></div>
        ) : isCommentsActive ? (
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-color-text-muted mt-10">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-lg border ${comment.resolved ? "bg-gray-50 border-gray-200" : "bg-white border-brand-border shadow-sm"
                    }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-color-text-main">
                      User
                    </span>
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
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {revisions.length === 0 ? (
              <p className="text-center text-color-text-muted mt-10">No versions saved yet.</p>
            ) : (
              revisions.map((rev, idx) => (
                <div
                  key={rev.id}
                  className="p-3 bg-white border border-brand-border rounded-lg shadow-sm hover:border-color-primary cursor-pointer transition-colors group flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${rev.isAutoSave ? "bg-gray-400" : "bg-color-primary"}`}></div>
                      <span className="font-semibold text-sm text-color-text-main">
                        {rev.name ? rev.name : (idx === 0 ? "Current Version" : `Version ${revisions.length - idx}`)}
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
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer input */}
      {isCommentsActive && (
        userPermission === "viewer" ? (
          <div className="p-4 border-t border-brand-border bg-amber-50 text-amber-900 text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <span>Viewer mode: Comment creation is disabled. Ask the owner for Commenter access.</span>
          </div>
        ) : (
          <div className="p-4 border-t border-brand-border bg-gray-50 flex flex-col gap-2">
            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center justify-between">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 font-bold ml-1">✕</button>
              </div>
            )}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-color-primary"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="bg-color-primary text-white p-2 rounded-lg hover:bg-color-primary-hover disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )
      )}

      {isHistoryActive && (
        userPermission === "viewer" ? (
          <div className="p-4 border-t border-brand-border bg-amber-50 text-amber-900 text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
            <span>Viewer mode: Manual saving is disabled. Ask the owner for Editor access.</span>
          </div>
        ) : (
          <div className="p-4 border-t border-brand-border bg-gray-50 flex flex-col gap-2">
            <form onSubmit={handleSaveVersion} className="flex gap-2">
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Describe this version..."
                className="flex-1 border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={savingRevision}
              />
              <button
                type="submit"
                disabled={savingRevision || !commitMessage.trim()}
                className="bg-color-text-main text-black px-3 py-2 text-xs font-bold rounded-lg hover:bg-color-text-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {savingRevision ? "Committing..." : "Commit"}
              </button>
            </form>
          </div>
        )
      )}
    </div>
  );
}
