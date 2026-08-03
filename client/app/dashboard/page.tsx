"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/Button";
import Loader from "@/components/ui/loader";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DocumentGrid from "@/components/dashboard/DocumentGrid";
import { ShareModal } from "@/components/editor/ShareModal";
import { Plus, Search } from "lucide-react";

type Tab = "owned" | "shared";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { documents, isLoading, error, createDocument, deleteDocument, duplicateDocument } = useDocuments();

  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("owned");
  const [shareDocId, setShareDocId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  const user = session?.user;

  const filteredDocs = useMemo(() => {
    if (!user) return [];
    let docs = documents;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter((d) => d.title.toLowerCase().includes(q));
    }

    docs = activeTab === "owned"
      ? docs.filter((d) => d.ownerId === user.id)
      : docs.filter((d) => d.ownerId !== user.id);

    return docs;
  }, [documents, searchQuery, activeTab, user]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const newDoc = await createDocument("Untitled Document");
      router.push(`/editor/${newDoc.id}`);
    } catch {
      // error shown by hook
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this document? This cannot be undone.")) {
      await deleteDocument(id);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateDocument(id);
  };

  const handleShare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShareDocId(id);
  };

  // Show full-screen loader while session is loading
  if (isPending || !session?.session) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <DashboardHeader
        user={user!}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* Tabs + Create button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex gap-4 border-b border-brand-border w-full sm:w-auto">
            {(["owned", "shared"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? "text-color-primary border-b-2 border-color-primary"
                    : "text-color-text-muted hover:text-color-text-main"
                }`}
              >
                {tab === "owned" ? "Owned by me" : "Shared with me"}
              </button>
            ))}
          </div>

          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-color-primary text-white hover:bg-color-primary-hover flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
          >
            {isCreating ? <Loader /> : <Plus size={20} />}
            Create Blank
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="relative md:hidden mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-primary"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 text-sm">
            {error}
          </div>
        )}

        <DocumentGrid
          documents={filteredDocs}
          currentUserId={user!.id}
          isLoading={isLoading}
          searchQuery={searchQuery}
          isCreating={isCreating}
          onOpen={(id) => router.push(`/editor/${id}`)}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onShare={handleShare}
          onCreate={handleCreate}
        />
      </main>

      {shareDocId && (
        <ShareModal documentId={shareDocId} onClose={() => setShareDocId(null)} />
      )}
    </div>
  );
}

