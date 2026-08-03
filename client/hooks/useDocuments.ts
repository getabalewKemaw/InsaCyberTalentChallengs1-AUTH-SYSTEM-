import { useState, useEffect, useCallback } from "react";
import { documentService } from "../services/api";

export interface Document {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await documentService.getDocuments();
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = async (title: string) => {
    try {
      const newDoc = await documentService.createDocument(title);
      setDocuments((prev) => [newDoc, ...prev]);
      return newDoc;
    } catch (err: any) {
      setError(err.message || "Failed to create document");
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await documentService.deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete document");
      throw err;
    }
  };

  const duplicateDocument = async (id: string) => {
    try {
      const newDoc = await documentService.duplicateDocument(id);
      setDocuments((prev) => [newDoc, ...prev]);
      return newDoc;
    } catch (err: any) {
      setError(err.message || "Failed to duplicate document");
      throw err;
    }
  };

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    createDocument,
    deleteDocument,
    duplicateDocument,
  };
}
