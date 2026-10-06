"use client";

import React, { useState } from "react";
import {
  Search,
  Share2,
  Sun,
  Moon,
  Clock,
  Plus,
} from "lucide-react";
import { useTheme } from "../theme-provider";
import { SearchModal } from "../search-modal";
import { ShareModal } from "../share-modal";
import { formatTimeAgo } from "@/lib/utils";

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    description: string;
    shareToken: string;
    shareAccess: string;
    updatedAt: string | Date;
    members?: any[];
  };
  onQuickAdd?: (type: string) => void;
}

export function ProjectHeader({ project, onQuickAdd }: ProjectHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const members = project.members || [];

  return (
    <>
      <header className="h-14 border-b border-slate-200 dark:border-[#1c2132] bg-white/80 dark:bg-[#0c0e15]/80 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        {/* Left: Project title & description */}
        <div className="flex items-center gap-3 overflow-hidden mr-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                {project.name}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                <Clock className="h-3 w-3" /> Updated {formatTimeAgo(project.updatedAt)}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xl">
              {project.description}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Team Member Avatars */}
          <div className="hidden md:flex items-center -space-x-1.5 mr-2">
            {members.slice(0, 4).map((m: any, idx: number) => {
              const u = m.user || m;
              return (
                <div
                  key={m.id || idx}
                  title={`${u.name} (${m.role || "MEMBER"})`}
                  className="h-6 w-6 rounded-full border-2 border-white dark:border-[#0c0e15] bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-[10px] font-semibold text-slate-700 dark:text-slate-200"
                >
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                  ) : (
                    u.name?.charAt(0)
                  )}
                </div>
              );
            })}
            {members.length > 4 && (
              <div className="h-6 w-6 rounded-full border-2 border-white dark:border-[#0c0e15] bg-slate-300 dark:bg-slate-800 text-[10px] font-semibold flex items-center justify-center text-slate-700 dark:text-slate-300">
                +{members.length - 4}
              </div>
            )}
          </div>

          {/* Quick Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#22283a] bg-slate-50 dark:bg-[#121520] hover:bg-slate-100 dark:hover:bg-[#181c2b] text-slate-500 dark:text-slate-400 text-xs transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search truth...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-[#1f2438] text-slate-600 dark:text-slate-300 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Quick Add Dropdown / Action */}
          {onQuickAdd && (
            <div className="relative group">
              <button
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
              <div className="absolute right-0 mt-1 w-44 rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#121520] p-1 shadow-xl hidden group-hover:block hover:block z-30">
                <button
                  onClick={() => onQuickAdd("resource")}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1e2f] rounded"
                >
                  + Add Resource
                </button>
                <button
                  onClick={() => onQuickAdd("idea")}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1e2f] rounded"
                >
                  + Add Idea
                </button>
                <button
                  onClick={() => onQuickAdd("link")}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1e2f] rounded"
                >
                  + Add Link
                </button>
                <button
                  onClick={() => onQuickAdd("decision")}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1e2f] rounded"
                >
                  + Add Decision
                </button>
                <button
                  onClick={() => onQuickAdd("task")}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1e2f] rounded"
                >
                  + Add Task
                </button>
                <button
                  onClick={() => onQuickAdd("workflow")}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-rose-500 font-medium hover:bg-rose-500/10 rounded"
                >
                  + Add Workflow Step
                </button>
              </div>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#22283a] bg-slate-50 dark:bg-[#121520] hover:bg-slate-100 dark:hover:bg-[#181c2b] text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
          >
            <Share2 className="h-3.5 w-3.5 text-blue-500" />
            <span>Share</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#181c2b] transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Global Search Dialog */}
      <SearchModal
        projectId={project.id}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Share Dialog */}
      <ShareModal
        projectId={project.id}
        shareToken={project.shareToken}
        initialAccess={project.shareAccess}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
