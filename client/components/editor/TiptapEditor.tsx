"use client";

import Loader from "@/components/ui/loader";
import CollaborativeEditor from "./CollaborativeEditor";
import { useHocuspocus } from "@/hooks/useHocuspocus";
import type { SaveStatus } from "@/types/editor.types";
import type { PermissionLevel } from "@/types/document.types";

interface TiptapEditorProps {
  documentId: string;
  user: { id: string; name?: string | null };
  isReadOnly?: boolean;
  userPermission?: PermissionLevel;
  onStatusChange?: (status: SaveStatus) => void;
}

export default function TiptapEditor({
  documentId,
  user,
  isReadOnly = false,
  userPermission,
  onStatusChange,
}: TiptapEditorProps) {
  const { ctx } = useHocuspocus({ documentId, user, onStatusChange });

  if (!ctx) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[600px] gap-3">
        <Loader />
        <p className="text-sm text-color-text-muted">Connecting and syncing document…</p>
      </div>
    );
  }

  return (
    <CollaborativeEditor
      key={documentId}
      documentId={documentId}
      ydoc={ctx.ydoc}
      provider={ctx.provider}
      user={user}
      isReadOnly={isReadOnly}
      userPermission={userPermission}
    />
  );
}
