"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Loader from "@/components/ui/loader";
import DocumentCard from "./DocumentCard";
import { Document } from "@/hooks/useDocuments";
interface DocumentGridProps {
  documents: Document[];
  currentUserId: string;
  isLoading: boolean;
  searchQuery: string;
  isCreating: boolean;
  onOpen: (id: string) => void;
  onDuplicate: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onShare?: (id: string, e: React.MouseEvent) => void;
  onCreate: () => void;
}

export default function DocumentGrid({
  documents,
  currentUserId,
  isLoading,
  searchQuery,
  isCreating,
  onOpen,
  onDuplicate,
  onDelete,
  onShare,
  onCreate,
}: DocumentGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-brand-border p-8 shadow-xs">
        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-color-text-main mb-2">No documents found</h3>
        <p className="text-color-text-muted mb-6 max-w-sm mx-auto">
          {searchQuery ? "Try a different search term or clear filters." : "Create your first document to start real-time editing & collaboration."}
        </p>
        {!searchQuery && (
          <Button
            onClick={onCreate}
            disabled={isCreating}
            className="bg-color-primary text-white hover:bg-color-primary-hover shadow-sm"
          >
            {isCreating ? <Loader /> : <Plus size={18} className="mr-2" />}
            Create Document
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          doc={doc}
          currentUserId={currentUserId}
          onClick={() => onOpen(doc.id)}
          onDuplicate={(e) => onDuplicate(doc.id, e)}
          onDelete={(e) => onDelete(doc.id, e)}
          onShare={onShare ? (e) => onShare(doc.id, e) : undefined}
        />
      ))}
    </div>
  );
}

