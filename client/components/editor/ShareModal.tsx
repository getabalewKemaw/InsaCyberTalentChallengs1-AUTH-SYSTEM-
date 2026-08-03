import React, { useState } from "react";
import { X, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { documentService } from "@/services/api";
import type { PermissionLevel } from "@/types/document.types";

interface ShareModalProps {
  documentId: string;
  onClose: () => void;
}

export function ShareModal({ documentId, onClose }: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>("viewer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await documentService.shareDocument(documentId, email, permissionLevel);
      setSuccess(`Document successfully shared with ${email} as ${permissionLevel}.`);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to share document");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b border-brand-border bg-brand-surface">
          <h2 className="text-lg font-bold text-color-text-main flex items-center gap-2">
            <Share2 size={18} className="text-color-primary" />
            Share Document
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">{success}</div>}

          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-color-text-main mb-1">User Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-color-primary focus:ring-1 focus:ring-color-primary"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-color-text-main mb-1">Permission Level</label>
              <select
                value={permissionLevel}
                onChange={(e) => setPermissionLevel(e.target.value as PermissionLevel)}
                className="w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-color-primary focus:ring-1 focus:ring-color-primary bg-white"
              >
                <option value="viewer">Viewer (Can read only)</option>
                <option value="commenter">Commenter (Can read and comment)</option>
                <option value="editor">Editor (Can edit)</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full bg-color-primary text-white py-2 font-semibold shadow-sm hover:bg-color-primary-hover transition-colors"
            >
              {isLoading ? "Sharing..." : "Share Document"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
