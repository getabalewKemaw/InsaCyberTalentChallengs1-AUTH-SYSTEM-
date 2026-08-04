"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "@/lib/auth-client";
import { FileText, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
interface DashboardHeaderProps {
  user: { name?: string | null; email: string; image?: string | null };
  searchQuery: string;
  onSearchChange: (q: string) => void;
}
export default function DashboardHeader({ user, searchQuery, onSearchChange }: DashboardHeaderProps) {
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="bg-brand-surface border-b border-brand-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="bg-color-primary text-white p-2 rounded-lg">
          <FileText size={24} />
        </div>
        <h1 className="text-2xl font-serif font-bold text-color-text-main tracking-tight">SyncWrite</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Desktop Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 bg-gray-50 border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-primary w-64 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 border-l border-brand-border pl-3 sm:pl-6">
          <span className="text-sm font-medium text-color-text-muted hidden sm:inline">{user.name}</span>
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              width={32}
              height={32}
              className="rounded-full border border-brand-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-color-secondary text-white font-bold flex items-center justify-center text-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}
        </div>

        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 text-color-text-muted hover:text-color-text-main hover:bg-gray-100 px-2 sm:px-3"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
