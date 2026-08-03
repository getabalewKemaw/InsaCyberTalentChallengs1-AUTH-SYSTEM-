"use client";

import { Editor } from "@tiptap/react";
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link as LinkIcon, Heading1, Heading2, Heading3
} from "lucide-react";

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline?.().run();
  
  const setAlignLeft = () => editor.chain().focus().setTextAlign?.("left").run();
  const setAlignCenter = () => editor.chain().focus().setTextAlign?.("center").run();
  const setAlignRight = () => editor.chain().focus().setTextAlign?.("right").run();
  
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();

  const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run();

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const btnClass = (isActive: boolean) => 
    `p-2 rounded-md hover:bg-gray-100 transition-colors ${isActive ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-600"}`;

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 bg-white border-b border-brand-border sticky top-0 z-20 w-full overflow-x-auto custom-scrollbar shadow-xs">
      <button onClick={toggleH1} className={btnClass(editor.isActive("heading", { level: 1 }))} title="Heading 1"><Heading1 size={18} /></button>
      <button onClick={toggleH2} className={btnClass(editor.isActive("heading", { level: 2 }))} title="Heading 2"><Heading2 size={18} /></button>
      <button onClick={toggleH3} className={btnClass(editor.isActive("heading", { level: 3 }))} title="Heading 3"><Heading3 size={18} /></button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>

      <button onClick={toggleBold} className={btnClass(editor.isActive("bold"))} title="Bold"><Bold size={18} /></button>
      <button onClick={toggleItalic} className={btnClass(editor.isActive("italic"))} title="Italic"><Italic size={18} /></button>
      <button onClick={toggleUnderline} className={btnClass(editor.isActive("underline"))} title="Underline"><UnderlineIcon size={18} /></button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button onClick={setAlignLeft} className={btnClass(editor.isActive({ textAlign: "left" }))} title="Align Left"><AlignLeft size={18} /></button>
      <button onClick={setAlignCenter} className={btnClass(editor.isActive({ textAlign: "center" }))} title="Align Center"><AlignCenter size={18} /></button>
      <button onClick={setAlignRight} className={btnClass(editor.isActive({ textAlign: "right" }))} title="Align Right"><AlignRight size={18} /></button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>

      <button onClick={toggleBulletList} className={btnClass(editor.isActive("bulletList"))} title="Bullet List"><List size={18} /></button>
      <button onClick={toggleOrderedList} className={btnClass(editor.isActive("orderedList"))} title="Ordered List"><ListOrdered size={18} /></button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>

      <button onClick={setLink} className={btnClass(editor.isActive("link"))} title="Insert Link"><LinkIcon size={18} /></button>
    </div>
  );
}
