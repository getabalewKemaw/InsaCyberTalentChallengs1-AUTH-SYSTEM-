"use client";

import { MessageSquare, Clock, X } from "lucide-react";

interface SidebarHeaderProps {
  isCommentsActive: boolean;
  onClose: () => void;
}

export default function SidebarHeader({ isCommentsActive, onClose }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-brand-border">
      <h3 className="font-bold text-color-text-main flex items-center gap-2">
        {isCommentsActive ? <MessageSquare size={18} /> : <Clock size={18} />}
        {isCommentsActive ? "Comments" : "Version History"}
      </h3>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X size={20} />
      </button>
    </div>
  );
}
