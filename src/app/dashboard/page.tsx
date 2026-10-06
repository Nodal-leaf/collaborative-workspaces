"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  FolderKanban,
  FileText,
  Lightbulb,
  CheckSquare,
  Users,
  Clock,
  ArrowRight,
  Compass,
  Sun,
  Moon,
  Trash2,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Modal } from "@/components/ui/modal";
import { formatTimeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    problem: "",
    goal: "",
    currentStatus: "",
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error("Failed to load projects:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setCreateModalOpen(false);
        setFormData({ name: "", description: "", problem: "", goal: "", currentStatus: "" });
        await fetchProjects();
      }
    } catch (e) {
      console.error("Failed to create project:", e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete project:", e);
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-[#1a1e2f] bg-white/70 dark:bg-[#0d0f18]/80 backdrop-blur-md sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
              Project Source of Truth
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">
              Team Knowledge OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#161a29] transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Create Project
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Project Workspaces
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Unified team spaces consolidating research, ideas, important links, architecture decisions, task boards, and final execution workflows.
            </p>
          </div>

          <div className="w-full md:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter projects..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#111420] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-3" />
            <span className="text-xs text-slate-400">Loading workspaces...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-slate-200 dark:border-[#22283a] p-8">
            <FolderKanban className="h-10 w-10 text-slate-400 mx-auto mb-3 opacity-50" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No projects found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Get started by creating your team&apos;s first unified source of truth workspace.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="h-4 w-4" /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const members = project.members || [];
              const count = project._count || {};

              return (
                <div
                  key={project.id}
                  className="group relative rounded-xl border border-slate-200 dark:border-[#1d2235] bg-white dark:bg-[#111420] p-5 shadow-xs hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Icon + Delete */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-blue-500 flex items-center justify-center font-bold text-sm">
                        {project.name.charAt(0)}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id, project.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 transition-all"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <Link
                      href={`/projects/${project.id}/overview`}
                      className="block group-hover:text-blue-500 transition-colors"
                    >
                      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {project.name}
                      </h2>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#181c2b]">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0c0e16]">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-blue-500">
                          <FileText className="h-3 w-3" /> {count.resources || 0}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase mt-0.5">Resources</div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0c0e16]">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-500">
                          <Lightbulb className="h-3 w-3" /> {count.ideas || 0}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase mt-0.5">Ideas</div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#0c0e16]">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-500">
                          <CheckSquare className="h-3 w-3" /> {count.tasks || 0}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase mt-0.5">Tasks</div>
                      </div>
                    </div>

                    {/* Footer Row: Members & Open Link */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center -space-x-1.5">
                        {members.slice(0, 3).map((m: any, idx: number) => {
                          const u = m.user || m;
                          return (
                            <div
                              key={m.id || idx}
                              title={u.name}
                              className="h-6 w-6 rounded-full border-2 border-white dark:border-[#111420] bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-[10px] font-semibold text-slate-700 dark:text-slate-200"
                            >
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="h-full w-full object-cover" />
                              ) : (
                                u.name?.charAt(0)
                              )}
                            </div>
                          );
                        })}
                        {members.length > 3 && (
                          <div className="h-6 w-6 rounded-full border-2 border-white dark:border-[#111420] bg-slate-300 dark:bg-slate-800 text-[10px] font-semibold flex items-center justify-center text-slate-700 dark:text-slate-300">
                            +{members.length - 3}
                          </div>
                        )}
                        <span className="pl-3 text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatTimeAgo(project.updatedAt)}
                        </span>
                      </div>

                      <Link
                        href={`/projects/${project.id}/overview`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:translate-x-0.5 transition-transform"
                      >
                        Open <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
        description="Initialize a single source of truth workspace for your team."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Agentic RAG Platform"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Description / What are we building? *
            </label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of the application or system..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Problem (What problem are we solving?)
              </label>
              <textarea
                rows={2}
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                placeholder="The core pain point..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Goal (What does success look like?)
              </label>
              <textarea
                rows={2}
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="Target metrics, demo delivery..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Status
            </label>
            <input
              type="text"
              value={formData.currentStatus}
              onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
              placeholder="e.g. Scaffolding backend architecture & API contracts"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1d2233]">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181c2b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Create Workspace
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
