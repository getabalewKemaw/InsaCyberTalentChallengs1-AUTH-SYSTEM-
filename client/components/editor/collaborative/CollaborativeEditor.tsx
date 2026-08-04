"use client";

import { useEffect } from "react";
import { useEditor } from "@tiptap/react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import EditorToolbar from "../EditorToolbar";
import { useCollaborators } from "@/hooks/useCollaborators";
import { useEditorExtensions } from "@/hooks/useEditorExtensions";
import PresenceBar from "./PresenceBar";
import ReadOnlyBanner from "./ReadOnlyBanner";
import EditorPaper from "./EditorPaper";
interface CollaborativeEditorProps {
  documentId: string;
  ydoc: Y.Doc;
  provider: HocuspocusProvider;
  user: { id: string; name?: string | null };
  isReadOnly?: boolean;
  userPermission?: string;
}

export default function CollaborativeEditor({
  ydoc,
  provider,
  user,
  isReadOnly = false,
  userPermission,
}: CollaborativeEditorProps) {
  if (provider && ydoc) {
    (provider as any).doc = ydoc;
  }

  // Hook to handle collaborators presence and awareness state
  const collaborators = useCollaborators(provider, user);

  // Hook to get the extensions list for TipTap
  const extensions = useEditorExtensions({ ydoc, provider });

  const editor = useEditor({
    editable: !isReadOnly,
    immediatelyRender: false,
    extensions,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none min-h-[900px] px-8 sm:px-16 py-12 pb-24",
        spellcheck: "true",
      },
    },
  });

  // Dynamically update editable status if permission changes
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!isReadOnly);
    }
  }, [editor, isReadOnly]);

  return (
    <div className="h-full w-full flex flex-col bg-brand-bg">
      <div className="w-full bg-white border-b border-brand-border sticky top-0 z-20">
        {isReadOnly ? (
          <ReadOnlyBanner userPermission={userPermission} />
        ) : (
          <EditorToolbar editor={editor ?? null} />
        )}

        <PresenceBar collaborators={collaborators} />
      </div>
      <EditorPaper editor={editor} />
    </div>
  );
}
