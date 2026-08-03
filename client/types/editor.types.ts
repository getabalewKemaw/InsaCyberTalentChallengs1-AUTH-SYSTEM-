import type * as Y from "yjs";
import type { HocuspocusProvider } from "@hocuspocus/provider";

export type SaveStatus = "saved" | "saving" | "offline";

export type SidebarTab = "comments" | "history" | null;

export interface AwarenessUser {
  name: string;
  color: string;
}

export interface CollabContext {
  ydoc: Y.Doc;
  provider: HocuspocusProvider;
}

export interface UserSessionInfo {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}
