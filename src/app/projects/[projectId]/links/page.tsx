"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Link2,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Filter,
  Loader2,
  Globe,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";

const LINK_CATEGORIES = [
  "All",
  "GitHub repository",
  "Discord",
  "WhatsApp",
  "Google Drive",
  "Figma",
  "Deployment",
  "Documentation",
  "Dataset",
  "API",
  "Demo",
  "Other",
];

export default function LinksPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    category: "GitHub repository",
  });

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const url = `/api/projects/${projectId}/links?search=${encodeURIComponent(
        search
      )}&category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (e) {
      console.error("Failed to fetch links:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchLinks();
  }, [projectId, category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLinks();
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingLink(null);
    setFormData({
      name: "",
      url: "",
      description: "",
      category: "GitHub repository",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (link: any) => {
    setEditingLink(link);
    setFormData({
      name: link.name || "",
      url: link.url || "",
      description: link.description || "",
      category: link.category || "Other",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) return;

    setSubmitting(true);
    try {
      const endpoint = editingLink
        ? `/api/projects/${projectId}/links/${editingLink.id}`
        : `/api/projects/${projectId}/links`;
      const method = editingLink ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalOpen(false);
        await fetchLinks();
      }
    } catch (e) {
      console.error("Failed to save link:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/links/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete link:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1d2235]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 font-semibold">
              Project Directory
            </span>
            <span className="text-xs text-slate-400">({links.length} links)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Important Links
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quick access to Discord, Figma, GitHub repo, deployment environments, staging APIs, and drive folders.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Link
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
            placeholder="Search links by name, URL, or notes..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#111420] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </form>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#111420] text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
          >
            {LINK_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="dark:bg-[#111420]">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Links List */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading links...</p>
        </div>
      ) : links.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-[#22283a] p-8">
          <Link2 className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No links recorded
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Save critical project URLs so the team never has to dig through chat channels again.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add First Link
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="group rounded-xl border border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420] p-4 shadow-xs hover:border-cyan-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    {link.category}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(link)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id, link.name)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {link.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {link.description || "No notes attached."}
                </p>

                <div className="mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#0c0e16] font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate">
                  {link.url}
                </div>
              </div>

              {/* Actions: Copy & Open */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#181c2b] flex items-center justify-end gap-2">
                <button
                  onClick={() => copyToClipboard(link.url, link.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#141724] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1e2f] transition-colors"
                >
                  {copiedId === link.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                  )}
                </button>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <span>Open</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Link Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLink ? "Edit Project Link" : "Add Project Link"}
        description="Save an important resource URL for the whole team."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Link Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. GitHub Monorepo or Discord Voice Channel"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              URL *
            </label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            >
              {LINK_CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Ingress gateway endpoint for benchmark tests..."
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
              {editingLink ? "Save Changes" : "Add Link"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
