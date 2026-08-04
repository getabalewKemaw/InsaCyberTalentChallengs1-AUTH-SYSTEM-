"use client";

interface CommitFormProps {
  commitMessage: string;
  onChangeMessage: (val: string) => void;
  savingRevision: boolean;
  onSubmitCommit: (e: React.FormEvent) => void;
}

export default function CommitForm({
  commitMessage,
  onChangeMessage,
  savingRevision,
  onSubmitCommit,
}: CommitFormProps) {
  return (
    <div className="p-4 border-t border-brand-border bg-gray-50 flex flex-col gap-2">
      <form onSubmit={onSubmitCommit} className="flex gap-2">
        <input
          type="text"
          value={commitMessage}
          onChange={(e) => onChangeMessage(e.target.value)}
          placeholder="Describe this version..."
          className="flex-1 border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={savingRevision}
        />
        <button
          type="submit"
          disabled={savingRevision || !commitMessage.trim()}
          className="bg-color-text-main text-black px-3 py-2 text-xs font-bold rounded-lg hover:bg-color-text-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {savingRevision ? "Committing..." : "Commit"}
        </button>
      </form>
    </div>
  );
}
