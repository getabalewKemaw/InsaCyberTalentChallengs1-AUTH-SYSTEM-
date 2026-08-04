"use client";

import { Send } from "lucide-react";

interface CommentFormProps {
  newCommentText: string;
  onChangeText: (val: string) => void;
  errorMessage: string | null;
  onClearError: () => void;
  onSubmitComment: (e: React.FormEvent) => void;
}

export default function CommentForm({
  newCommentText,
  onChangeText,
  errorMessage,
  onClearError,
  onSubmitComment,
}: CommentFormProps) {
  return (
    <div className="p-4 border-t border-brand-border bg-gray-50 flex flex-col gap-2">
      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={onClearError} className="text-red-500 hover:text-red-700 font-bold ml-1">✕</button>
        </div>
      )}
      <form onSubmit={onSubmitComment} className="flex gap-2">
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => onChangeText(e.target.value)}
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
  );
}
