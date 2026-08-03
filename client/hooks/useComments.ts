"use client";

import { useState, useCallback, useEffect } from "react";
import { documentService } from "@/services/api";
import type { Comment } from "@/types/comment.types";

export function useComments(documentId: string, isActive: boolean) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentService.getComments(documentId);
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (isActive) {
      fetchComments();
    }
  }, [isActive, fetchComments]);

  const addComment = async (content: string) => {
    if (!content.trim()) return;
    setErrorMessage(null);
    try {
      const newComment = await documentService.addComment(documentId, content);
      setComments((prev) => [...prev, newComment]);
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Forbidden") || msg.includes("403")) {
        setErrorMessage("Only Commenters or Editors can add comments to this document.");
      } else {
        setErrorMessage(msg || "Failed to add comment.");
      }
    }
  };

  const resolveComment = async (id: string) => {
    try {
      await documentService.resolveComment(id);
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, resolved: true } : c))
      );
    } catch (err) {
      console.error("Failed to resolve comment:", err);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await documentService.deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  return {
    comments,
    loading,
    errorMessage,
    setErrorMessage,
    fetchComments,
    addComment,
    resolveComment,
    deleteComment,
  };
}
