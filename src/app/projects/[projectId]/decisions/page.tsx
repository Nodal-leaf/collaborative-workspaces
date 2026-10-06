"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  GitCommit,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  HelpCircle,
  Split,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

export default function DecisionsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    decision: "",
    context: "",
    chosenSolution: "",
    alternativesConsidered: "",
    madeBy: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      const url = `/api/projects/${projectId}/decisions?search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDecisions(data);
      }
    } catch (e) {
      console.error("Failed to fetch decisions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchDecisions();
  }, [projectId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDecisions();
  };

  const handleOpenAdd = () => {
    setEditingDecision(null);
    setFormData({
      decision: "",
      context: "",
      chosenSolution: "",
      alternativesConsidered: "",
      madeBy: "",
      date: new Date().toISOString().split("T")[0],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (dec: any) => {
    setEditingDecision(dec);
    setFormData({
      decision: dec.decision || "",
      context: dec.context || "",
      chosenSolution: dec.chosenSolution || "",
      alternativesConsidered: dec.alternativesConsidered || "",
      madeBy: dec.madeBy || "",
      date: dec.date ? new Date(dec.date).toISOString().split("T")[0] : "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.decision.trim()) return;

    setSubmitting(true);
    try {
      const endpoint = editingDecision
        ? `/api/projects/${projectId}/decisions/${editingDecision.id}`
        : `/api/projects/${projectId}/decisions`;
      const method = editingDecision ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalOpen(false);
        await fetchDecisions();
      }
    } catch (e) {
      console.error("Failed to save decision:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, decision: string) => {
    if (!confirm(`Are you sure you want to delete decision "${decision}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/decisions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDecisions((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete decision:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1d2235]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-semibold">
              Architecture & Strategy Log
            </span>
            <span className="text-xs text-slate-400">({decisions.length} recorded)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Decision Log (ADR)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prevents the team from asking: &ldquo;Why did we choose this architecture or trade-off?&rdquo;
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Record Decision
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search decisions by context, solution, decider..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#111420] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
        />
      </form>

      {/* Decisions Timeline List */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading decisions...</p>
        </div>
      ) : decisions.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-[#22283a] p-8">
          <GitCommit className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No decisions logged yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Document key architectural choices, libraries selected, and rejected alternatives.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" /> Record First Decision
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((dec) => (
            <div
              key={dec.id}
              className="group rounded-xl border border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420] p-5 shadow-xs hover:border-purple-500/50 hover:shadow-md transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                    <GitCommit className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {dec.decision}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {dec.madeBy || "Team Consensus"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(dec.date || dec.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-start opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(dec)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dec.id, dec.decision)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Decision Details Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-[#181c2b] text-xs">
                {/* Context */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e16]">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <HelpCircle className="h-3 w-3 text-amber-500" /> Context / Problem
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                    {dec.context || "No context specified."}
                  </p>
                </div>

                {/* Chosen Solution */}
                <div className="p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-500/20">
                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Chosen Solution
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-[11px] font-medium">
                    {dec.chosenSolution || "No solution documented."}
                  </p>
                </div>

                {/* Alternatives Considered */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e16]">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Split className="h-3 w-3 text-blue-500" /> Alternatives Considered
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                    {dec.alternativesConsidered || "None documented."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Decision Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDecision ? "Edit Decision Record" : "Record Technical Decision"}
        description="Preserve the reasoning, trade-offs, and alternatives evaluated."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Decision Summary *
            </label>
            <input
              type="text"
              required
              value={formData.decision}
              onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
              placeholder="e.g. Use SQLite with Prisma for local portability"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Who made the decision?
              </label>
              <input
                type="text"
                value={formData.madeBy}
                onChange={(e) => setFormData({ ...formData, madeBy: e.target.value })}
                placeholder="e.g. Abdul & Sarah"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Context / Problem
            </label>
            <textarea
              rows={2}
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              placeholder="Why was this decision needed? What problem arose?"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Chosen Solution
            </label>
            <textarea
              rows={2}
              value={formData.chosenSolution}
              onChange={(e) => setFormData({ ...formData, chosenSolution: e.target.value })}
              placeholder="What did we agree to execute?"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alternatives Considered
            </label>
            <textarea
              rows={2}
              value={formData.alternativesConsidered}
              onChange={(e) => setFormData({ ...formData, alternativesConsidered: e.target.value })}
              placeholder="Other approaches and why they were passed on..."
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
              {editingDecision ? "Save Changes" : "Record Decision"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
