"use client";

import { useState, useCallback, useEffect } from "react";
import { documentService } from "@/services/api";
import type { Revision } from "@/types/revision.types";

export function useRevisions(documentId: string, isActive: boolean) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRevisions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentService.getRevisions(documentId);
      setRevisions(data);
    } catch (err) {
      console.error("Failed to fetch revisions:", err);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (isActive) {
      fetchRevisions();
    }
  }, [isActive, fetchRevisions]);

  const restoreRevision = async (revId: string) => {
    if (!confirm("Are you sure you want to restore this version? This will overwrite the current content.")) return;
    try {
      await documentService.restoreRevision(documentId, revId);
      alert("Version restored! Please refresh the page to see changes.");
      window.location.reload();
    } catch (err) {
      console.error("Failed to restore revision:", err);
      alert("Failed to restore version");
    }
  };

  return {
    revisions,
    loading,
    fetchRevisions,
    restoreRevision,
  };
}
