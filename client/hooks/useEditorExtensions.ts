"use client";

import { useMemo } from "react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Extension } from "@tiptap/core";
import { yCursorPlugin } from "@tiptap/y-tiptap";

interface UseEditorExtensionsProps {
  ydoc: Y.Doc;
  provider: HocuspocusProvider;
}

export function useEditorExtensions({ ydoc, provider }: UseEditorExtensionsProps) {
  return useMemo(() => {
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
  }, [ydoc, provider]);
}
