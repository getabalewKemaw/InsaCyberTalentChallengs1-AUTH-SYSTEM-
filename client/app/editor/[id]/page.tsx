"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { documentService } from "@/services/api";
import dynamic from "next/dynamic";
import Loader from "@/components/ui/loader";
import EditorHeader from "@/components/editor/EditorHeader";
import EditorSidebar from "@/components/editor/EditorSidebar";
import { ShareModal } from "@/components/editor/ShareModal";
import { exportToPDF, exportToMarkdown } from "@/utils/export.utils";

const TiptapEditor = dynamic(() => import("@/components/editor/TiptapEditor"), {
  ssr: false,
  loading: () => <Loader />,
});


type SidebarTab = "comments" | "history" | null;

interface DocumentData {
  id: string;
  title: string;
  ownerId: string;
  userPermission?: "owner" | "editor" | "commenter" | "viewer";
}

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = use(params);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "offline">("saved");

  // Track the last title that was successfully saved to the server.
  // This is a ref (not state) so it doesn't trigger re-renders, and
  // it won't be stale when the onBlur callback fires.
  const savedTitleRef = useRef<string>("");

  useEffect(() => {
    if (isPending) return;
    if (!session?.session) {
      router.push("/signin");
      return;
    }
    documentService
      .getDocument(documentId)
      .then((data) => {
        setDoc(data);
        // Initialise the ref to whatever title came from the server
        savedTitleRef.current = data?.title ?? "";
      })
      .catch(() => setError("Failed to load document. You may not have access."))
      .finally(() => setLoading(false));
  }, [documentId, session, isPending, router]);

  // Save title to the server when the input loses focus.
  // Compares against savedTitleRef (the server value) — NOT doc.title in state,
  // because onTitleChange updates doc.title on every keystroke, making the
  // equality check always true and silently skipping the save.
  const handleTitleBlur = useCallback(
    async (newTitle: string) => {
      if (!doc) return;
      const trimmed = newTitle.trim();
      if (!trimmed || trimmed === savedTitleRef.current) return;
      try {
        setSaveStatus("saving");
        await documentService.updateDocument(doc.id, trimmed);
        savedTitleRef.current = trimmed;          // Mark new title as saved
        setDoc((prev) => prev ? { ...prev, title: trimmed } : prev);
        setSaveStatus("saved");
      } catch {
        // Silently fail — user will see stale title on refresh, not a crash
      }
    },
    [doc]
  );

  // Also save on Enter key so users don't need to click away
  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  const handleExportPDF = () => {
    exportToPDF(doc?.title || "Document");
  };

  const handleExportMarkdown = () => {
    exportToMarkdown(doc?.title || "document");
  };

  const toggleTab = (tab: "comments" | "history") =>
    setActiveTab((prev) => (prev === tab ? null : tab));

  if (isPending || loading) return <Loader />;

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center gap-4">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-color-text-main max-w-sm">{error ?? "Document not found."}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-color-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-color-primary-hover transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const user = session!.user;
  const isReadOnly = doc.userPermission === "viewer" || doc.userPermission === "commenter";

  return (
    <div className="flex flex-col h-screen bg-brand-bg">
      <EditorHeader
        title={doc.title}
        user={user}
        activeTab={activeTab}
        saveStatus={saveStatus}
        isReadOnly={isReadOnly}
        userPermission={doc.userPermission}
        onTitleChange={(val) => setDoc((prev) => (prev ? { ...prev, title: val } : prev))}
        onTitleBlur={handleTitleBlur}
        onTitleKeyDown={handleTitleKeyDown}
        onTabToggle={toggleTab}
        onShareClick={() => setShowShareModal(true)}
        onExportPDF={handleExportPDF}
        onExportMarkdown={handleExportMarkdown}
      />

      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <TiptapEditor
            documentId={doc.id}
            user={user}
            isReadOnly={isReadOnly}
            userPermission={doc.userPermission}
            onStatusChange={setSaveStatus}
          />
        </div>


        {activeTab && (
          <EditorSidebar
            documentId={doc.id}
            activeTab={activeTab}
            onClose={() => setActiveTab(null)}
            currentUser={user}
            userPermission={doc.userPermission}
          />
        )}
      </main>

      {showShareModal && (
        <ShareModal documentId={doc.id} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
