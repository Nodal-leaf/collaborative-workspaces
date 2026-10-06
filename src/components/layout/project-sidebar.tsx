"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Lightbulb,
  Link2,
  GitCommit,
  CheckSquare,
  ListTree,
  ChevronLeft,
  Users,
  Compass,
} from "lucide-react";

interface ProjectSidebarProps {
  projectId: string;
  projectName: string;
  counts?: {
    resources?: number;
    ideas?: number;
    links?: number;
    decisions?: number;
    tasks?: number;
  };
  members?: any[];
}

export function ProjectSidebar({
  projectId,
  projectName,
  counts,
  members = [],
}: ProjectSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: `/projects/${projectId}/overview`,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Resources",
      href: `/projects/${projectId}/resources`,
      icon: FileText,
      badge: counts?.resources ?? null,
      color: "text-blue-500",
    },
    {
      label: "Ideas",
      href: `/projects/${projectId}/ideas`,
      icon: Lightbulb,
      badge: counts?.ideas ?? null,
      color: "text-amber-500",
    },
    {
      label: "Links",
      href: `/projects/${projectId}/links`,
      icon: Link2,
      badge: counts?.links ?? null,
      color: "text-cyan-500",
    },
    {
      label: "Decisions",
      href: `/projects/${projectId}/decisions`,
      icon: GitCommit,
      badge: counts?.decisions ?? null,
      color: "text-purple-500",
    },
    {
      label: "Tasks",
      href: `/projects/${projectId}/tasks`,
      icon: CheckSquare,
      badge: counts?.tasks ?? null,
      color: "text-emerald-500",
    },
    {
      label: "Final Executable Workflow",
      href: `/projects/${projectId}/workflow`,
      icon: ListTree,
      badge: "LIVE",
      color: "text-rose-500",
      highlight: true,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-[#1c2132] bg-[#f8fafc] dark:bg-[#0c0e15] flex flex-col shrink-0 select-none">
      {/* Top Project Selector */}
      <div className="p-3 border-b border-slate-200 dark:border-[#1c2132]">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-2 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> All Projects
        </Link>
        <div className="flex items-center gap-2 px-1">
          <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {projectName.charAt(0)}
          </div>
          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
            {projectName}
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Source of Truth
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-slate-200/80 dark:bg-[#1a1f30] text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#131622] hover:text-slate-900 dark:hover:text-slate-200"
              } ${item.highlight ? "border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 dark:text-rose-400" : ""}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    item.highlight ? "text-rose-500" : item.color || "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    item.highlight
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-slate-200 dark:bg-[#1a1f30] text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Team Members List */}
        <div className="pt-5 px-2">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Users className="h-3 w-3" /> Team ({members.length})
            </span>
          </div>
          <div className="space-y-1.5">
            {members.map((m) => {
              const u = m.user || m;
              return (
                <div
                  key={m.id || u.id}
                  className="flex items-center gap-2 px-1.5 py-1 rounded text-xs text-slate-600 dark:text-slate-300"
                >
                  <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-semibold overflow-hidden">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                    ) : (
                      u.name?.charAt(0)
                    )}
                  </div>
                  <span className="truncate flex-1">{u.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{m.role || "MEMBER"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="p-3 border-t border-slate-200 dark:border-[#1c2132] text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Compass className="h-3.5 w-3.5 text-blue-500" /> Source of Truth
        </span>
        <span className="text-[10px] font-mono opacity-60">v1.0</span>
      </div>
    </aside>
  );
}
