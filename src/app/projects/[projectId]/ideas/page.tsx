"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Lightbulb,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  User,
  Filter,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  XCircle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { formatTimeAgo } from "@/lib/utils";

const STATUSES = ["All", "New", "Discussing", "Accepted", "Rejected", "Implemented"];

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; icon: any }> = {
  New: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/20",
    icon: Sparkles,
  },
  Discussing: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    icon: MessageSquare,
  },
  Accepted: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  Rejected: {
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/20",
    icon: XCircle,
  },
  Implemented: {
    bg: "bg-purple-500/10",
    text: "text-purple-500",
    border: "border-purple-500/20",
    icon: CheckCircle2,
  },
};

export default function IdeasPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contributor: "",
    tags: "",
    status: "New",
  });

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const url = `/api/projects/${projectId}/ideas?search=${encodeURIComponent(
        search
      )}&status=${encodeURIComponent(statusFilter)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (e) {
      console.error("Failed to fetch ideas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchIdeas();
  }, [projectId, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIdeas();
  };

  const handleOpenAdd = () => {
    setEditingIdea(null);
    setFormData({
      title: "",
      description: "",
      contributor: "",
      tags: "",
      status: "New",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (idea: any) => {
    setEditingIdea(idea);
    setFormData({
      title: idea.title || "",
      description: idea.description || "",
      contributor: idea.contributor || "",
      tags: idea.tags || "",
      status: idea.status || "New",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    try {
      const endpoint = editingIdea
        ? `/api/projects/${projectId}/ideas/${editingIdea.id}`
        : `/api/projects/${projectId}/ideas`;
      const method = editingIdea ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalOpen(false);
        await fetchIdeas();
      }
    } catch (e) {
      console.error("Failed to save idea:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ideaId: string, newStatus: string) => {
    try {
      // Optimistic update
      setIdeas((prev) =>
        prev.map((i) => (i.id === ideaId ? { ...i, status: newStatus } : i))
      );
      await fetch(`/api/projects/${projectId}/ideas/${ideaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error("Failed to update status:", e);
      fetchIdeas();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete idea "${title}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/ideas/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIdeas((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete idea:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1d2235]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-semibold">
              Brainstorming & Observations
            </span>
            <span className="text-xs text-slate-400">({ideas.length} ideas)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Idea Board
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Collect proposals, feature requests, experimental observations, and architecture brainstorms.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Idea
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ideas by title, notes, contributor, tags..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#111420] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </form>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#111420] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#191d2c]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading ideas...</p>
        </div>
      ) : ideas.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-[#22283a] p-8">
          <Lightbulb className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No ideas found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Spark discussions by posting an innovative proposal or observation.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add First Idea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ideas.map((idea) => {
            const config = STATUS_CONFIG[idea.status] || STATUS_CONFIG.New;
            const StatusIcon = config.icon;
            const tagList = idea.tags
              ? idea.tags
                  .split(",")
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              : [];

            return (
              <div
                key={idea.id}
                className="group relative rounded-xl border border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420] p-5 shadow-xs hover:border-amber-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Status & Edit Controls */}
                  <div className="flex items-center justify-between mb-3">
                    {/* Status Pill Switcher */}
                    <div className="relative">
                      <select
                        value={idea.status}
                        onChange={(e) => handleStatusChange(idea.id, e.target.value)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${config.border} ${config.bg} ${config.text} cursor-pointer focus:outline-hidden`}
                      >
                        {STATUSES.filter((s) => s !== "All").map((s) => (
                          <option key={s} value={s} className="dark:bg-[#111420] text-slate-200">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(idea)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Edit Idea"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(idea.id, idea.title)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                        title="Delete Idea"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-amber-500 transition-colors">
                    {idea.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {idea.description || "No description provided."}
                  </p>

                  {/* Tags */}
                  {tagList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {tagList.map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#181c2b] text-slate-600 dark:text-slate-400"
                        >
                          <Tag className="h-2.5 w-2.5 text-slate-400" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#181c2b] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {idea.contributor || "Team Member"}
                  </span>
                  <span>{formatTimeAgo(idea.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Idea Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIdea ? "Edit Idea" : "Add New Idea"}
        description="Share an architectural idea, benchmark optimization, or feature proposal."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Hierarchical Planner + Subagent Swarm"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              >
                {STATUSES.filter((s) => s !== "All").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contributor
              </label>
              <input
                type="text"
                value={formData.contributor}
                onChange={(e) => setFormData({ ...formData, contributor: e.target.value })}
                placeholder="e.g. Abdul"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Details
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain the idea, trade-offs, and expected impact..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="architecture, scaling, routing"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1d2233]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181c2b]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {editingIdea ? "Save Changes" : "Add Idea"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
