"use client";

import { EditorContent, Editor } from "@tiptap/react";

interface EditorPaperProps {
  editor: Editor | null;
}

export default function EditorPaper({ editor }: EditorPaperProps) {
  return (
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
  );
}
