"use client";

import type { Revision } from "@/types/revision.types";
import RevisionItem from "./RevisionItem";

interface RevisionListProps {
  revisions: Revision[];
  restoreRevision: (id: string) => void;
}

export default function RevisionList({ revisions, restoreRevision }: RevisionListProps) {
  if (revisions.length === 0) {
    return <p className="text-center text-color-text-muted mt-10">No versions saved yet.</p>;
  }

  return (
    <div className="space-y-3">
      {revisions.map((rev, idx) => (
        <RevisionItem
          key={rev.id}
          rev={rev}
          idx={idx}
          revisionsLength={revisions.length}
          restoreRevision={restoreRevision}
        />
      ))}
    </div>
  );
}
