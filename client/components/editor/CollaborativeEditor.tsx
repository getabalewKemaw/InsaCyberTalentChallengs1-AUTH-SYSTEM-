"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Extension } from "@tiptap/core";
import { yCursorPlugin } from "@tiptap/y-tiptap";
import EditorToolbar from "./EditorToolbar";

import { Eye, MessageSquare } from "lucide-react";

interface CollaborativeEditorProps {
  documentId: string;
  ydoc: Y.Doc;
  provider: HocuspocusProvider;
  user: { id: string; name?: string | null };
  isReadOnly?: boolean;
  userPermission?: string;
}

interface AwarenessUser {
  name: string;
  color: string;
}

/**
 * CollaborativeEditor
 *
 * Configured with Tiptap v3 + Yjs + yCursorPlugin for robust real-time document synchronization,
 * live carets, name tags, wide document paper layout, and strict read-only permission enforcement.
 */

export default function CollaborativeEditor({
  ydoc,
  provider,
  user,
  isReadOnly = false,
  userPermission,
}: CollaborativeEditorProps) {
  // Track online collaborators for the presence bar
  const [collaborators, setCollaborators] = useState<AwarenessUser[]>([]);

  if (provider && ydoc) {
    (provider as any).doc = ydoc;
  }

  const userColor =
    provider.awareness?.getLocalState()?.user?.color || "#3b82f6";
  const userName = user.name || "Anonymous User";

  // Update awareness state
  useEffect(() => {
    if (provider?.awareness) {
      provider.setAwarenessField("user", {
        name: userName,
        color: userColor,
      });
    }
  }, [provider, userName, userColor]);

  // Subscribe to awareness changes to track who is online
  const updateCollaborators = useCallback(() => {
    if (!provider?.awareness) return;
    const states = provider.awareness.getStates();
    const myClientId = provider.awareness.clientID;
    const users: AwarenessUser[] = [];
    states.forEach((state, clientId) => {
      if (clientId !== myClientId && state?.user) {
        users.push(state.user as AwarenessUser);
      }
    });
    setCollaborators(users);
  }, [provider]);

  useEffect(() => {
    if (!provider?.awareness) return;
    provider.awareness.on("change", updateCollaborators);
    updateCollaborators();
    return () => {
      provider.awareness?.off("change", updateCollaborators);
    };
  }, [provider, updateCollaborators]);

  // CRITICAL: Memoize extensions so useEditor does NOT re-initialize plugins on re-renders
  const extensions = useMemo(() => {
    const CursorExtension = Extension.create({
      name: "customCollaborationCursor",
      addProseMirrorPlugins() {
        if (!provider?.awareness) return [];
        return [
          yCursorPlugin(provider.awareness, {
            cursorBuilder: (u: any) => {
              const cursor = document.createElement("span");
              cursor.classList.add("ProseMirror-yjs-cursor");
              cursor.setAttribute(
                "style",
                `border-color: ${u.color || "#3b82f6"}; background-color: ${u.color || "#3b82f6"}1a`
              );

              const label = document.createElement("div");
              label.classList.add("ProseMirror-yjs-cursor-label");
              label.textContent = u.name || "Anonymous";
              label.setAttribute(
                "style",
                `background-color: ${u.color || "#3b82f6"}`
              );
              cursor.appendChild(label);

              return cursor;
            },
          }),
        ];
      },
    });

    return [
      StarterKit.configure({
        // Disable built-in history, link, and underline so Tiptap uses explicit extensions without duplicate warnings
        history: false,
        link: false,
        underline: false,
      } as any),
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      // Bind Tiptap document model to the shared Yjs document
      Collaboration.configure({ document: ydoc }),
      CursorExtension,
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ydoc, provider]);

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
      {/* Outer Toolbar Strip: sits above the document paper */}
      <div className="w-full bg-white border-b border-brand-border sticky top-0 z-20">
        {isReadOnly ? (
          <div className="flex items-center justify-between px-6 py-2.5 bg-amber-50/80 border-b border-amber-200/60 text-amber-900 text-xs font-semibold">
            <span className="flex items-center gap-2">
              {userPermission === "commenter" ? (
                <>
                  <MessageSquare size={15} className="text-amber-700" />
                  <span>Commenter mode — Text editing disabled, comment creation active in sidebar</span>
                </>
              ) : (
                <>
                  <Eye size={15} className="text-amber-700" />
                  <span>Read-only mode (Viewing permission)</span>
                </>
              )}
            </span>
            <span className="text-amber-700/80 font-normal">Text editing disabled</span>
          </div>
        ) : (
          <EditorToolbar editor={editor ?? null} />
        )}

        {/* Presence bar: shows other users currently viewing this document */}
        {collaborators.length > 0 && (
          <div className="flex items-center gap-2 px-6 py-2 bg-blue-50/80 border-t border-blue-100/60 flex-wrap">
            <span className="text-xs text-blue-700 font-semibold mr-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block"></span>
              Also editing:
            </span>
            {collaborators.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-xs"
                style={{ backgroundColor: c.color }}
                title={c.name}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80 inline-block" />
                {c.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paper Workspace Scroll Container */}
      <div
        id="editor-paper-container"
        className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 flex justify-center custom-scrollbar"
        onClick={() => editor?.chain().focus().run()}
      >
        {/* Expanding Pristine Document Paper Canvas */}
        <div
          id="editor-paper"
          className="w-[92%] max-w-5xl bg-white border border-gray-200/90 rounded-md min-h-[1056px] h-auto cursor-text transition-shadow my-6 mb-28"
        >
          <EditorContent editor={editor} className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
}
