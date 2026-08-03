"use client";

import { useState, useEffect, useCallback } from "react";
import type { HocuspocusProvider } from "@hocuspocus/provider";
import type { AwarenessUser } from "@/types/editor.types";

export function useCollaborators(provider?: HocuspocusProvider | null) {
  const [collaborators, setCollaborators] = useState<AwarenessUser[]>([]);

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

  return collaborators;
}
