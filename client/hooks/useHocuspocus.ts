"use client";

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";
import type { CollabContext, SaveStatus } from "@/types/editor.types";
import { getUserColor } from "@/utils/color.utils";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5001/collaboration";

export interface UseHocuspocusOptions {
  documentId: string;
  user: { id: string; name?: string | null };
  onStatusChange?: (status: SaveStatus) => void;
}

export function useHocuspocus({ documentId, user, onStatusChange }: UseHocuspocusOptions) {
  const [ctx, setCtx] = useState<CollabContext | null>(null);

  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const userId = user.id;
  const userName = user.name;

  useEffect(() => {
    setCtx(null);

    const ydoc = new Y.Doc();
    let isMounted = true;

    const provider = new HocuspocusProvider({
      url: WS_BASE,
      name: documentId,
      document: ydoc,
      onSynced() {
        if (isMounted) {
          clearTimeout(fallbackTimer);
          setCtx({ ydoc, provider });
          onStatusChangeRef.current?.("saved");
        }
      },
      onStatus({ status }) {
        if (!isMounted) return;
        const s = String(status);
        if (s === "disconnected" || s === "0") {
          onStatusChangeRef.current?.("offline");
        }
      },
    });

    // Ensure provider.doc is set for compatibility with Yjs cursor plugins
    (provider as any).doc = ydoc;

    // Set user awareness
    const userColor = getUserColor(userId || userName || "user");
    provider.setAwarenessField("user", {
      name: userName || "Anonymous User",
      color: userColor,
    });

    // Fallback: mount even if synced event doesn't fire within 4 seconds
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setCtx({ ydoc, provider });
        if (provider.isSynced) {
          onStatusChangeRef.current?.("saved");
        } else {
          onStatusChangeRef.current?.("offline");
        }
      }
    }, 4000);

    const handleUpdate = () => {
      onStatusChangeRef.current?.("saving");
    };

    ydoc.on("update", handleUpdate);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      ydoc.off("update", handleUpdate);
      provider.destroy();
      ydoc.destroy();
    };
  }, [documentId, userId, userName]);

  // Monitor typing updates for live auto-save indicator
  useEffect(() => {
    if (!ctx) return;
    const { ydoc } = ctx;

    let saveTimer: ReturnType<typeof setTimeout> | null = null;

    const handleUpdate = () => {
      onStatusChangeRef.current?.("saving");
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        onStatusChangeRef.current?.("saved");
      }, 1200);
    };

    ydoc.on("update", handleUpdate);

    return () => {
      if (saveTimer) clearTimeout(saveTimer);
      ydoc.off("update", handleUpdate);
    };
  }, [ctx]);

  return { ctx };
}
