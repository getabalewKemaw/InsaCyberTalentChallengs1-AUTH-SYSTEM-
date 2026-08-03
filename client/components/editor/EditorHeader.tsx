"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, History, MessageSquare, Share2, CloudUpload, Check, CloudOff, ChevronDown, Download } from "lucide-react";
import type { SaveStatus, SidebarTab, UserSessionInfo } from "@/types/editor.types";
import type { PermissionLevel } from "@/types/document.types";

interface EditorHeaderProps {
  title: string;
  user: UserSessionInfo;
  activeTab: SidebarTab;
  saveStatus?: SaveStatus;
  isReadOnly?: boolean;
  userPermission?: PermissionLevel;
  onTitleChange: (val: string) => void;
  onTitleBlur: (val: string) => void;
  onTitleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onTabToggle: (tab: "comments" | "history") => void;
  onShareClick: () => void;
  onExportPDF: () => void;
  onExportMarkdown: () => void;
}

export default function EditorHeader({
  title,
  user,
  activeTab,
  saveStatus = "saved",
  isReadOnly = false,
  onTitleChange,
  onTitleBlur,
  onTitleKeyDown,
  onTabToggle,
  onShareClick,
  onExportPDF,
  onExportMarkdown,
}: EditorHeaderProps) {
  const router = useRouter();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabBtn = (tab: "comments" | "history", label: string, Icon: React.FC<{ size?: number }>) => (
    <button
      onClick={() => onTabToggle(tab)}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
        activeTab === tab ? "bg-gray-200 text-color-primary" : "text-color-text-main hover:bg-gray-100"
      }`}
    >
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <header className="h-16 bg-brand-surface border-b border-brand-border flex items-center justify-between px-4 sticky top-0 z-30 gap-3">
      {/* Left: back + title + live save status */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 text-color-text-muted hover:text-color-text-main hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="text"
            value={title}
            readOnly={isReadOnly}
            onChange={(e) => !isReadOnly && onTitleChange(e.target.value)}
            onBlur={(e) => !isReadOnly && onTitleBlur(e.target.value)}
            onKeyDown={onTitleKeyDown}
            className={`font-serif text-xl font-bold text-color-text-main bg-transparent border-none rounded px-2 py-1 min-w-0 w-40 sm:w-64 truncate ${
              isReadOnly ? "cursor-default opacity-90 focus:outline-none" : "focus:outline-none focus:ring-2 focus:ring-color-primary-hover"
            }`}
            placeholder="Untitled Document"
          />

          {/* Auto-Save Status Indicator */}
          <div className="hidden sm:flex items-center ml-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 border border-gray-100 flex-shrink-0 transition-all">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-blue-600">
                <CloudUpload size={14} className="animate-pulse" />
                <span>Saving…</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-gray-500">
                <Check size={14} className="text-green-600" />
                <span>Saved to cloud</span>
              </span>
            )}
            {saveStatus === "offline" && (
              <span className="flex items-center gap-1.5 text-amber-600">
                <CloudOff size={14} />
                <span>Saved offline</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Export dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setShowExportMenu((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-color-text-main hover:bg-gray-100 border border-gray-200 shadow-2xs transition-colors"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${showExportMenu ? "rotate-180" : ""}`} />
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-lg shadow-xl border border-brand-border py-1 z-50">
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportPDF();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-color-text-main hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
              >
                <span>Export as PDF</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportMarkdown();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-color-text-main hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
              >
                <span>Export as Markdown</span>
              </button>
            </div>
          )}
        </div>

        {tabBtn("history", "History", History)}
        {tabBtn("comments", "Comments", MessageSquare)}

        <button
          onClick={onShareClick}
          className="flex items-center gap-2 px-4.5 py-1.5 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 rounded-full shadow-sm hover:shadow transition-all border border-blue-700/20"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>

        {/* Live presence indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Live</span>
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-color-secondary text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
      </div>
    </header>
  );
}
