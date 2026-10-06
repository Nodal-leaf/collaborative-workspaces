"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ListTree,
  Plus,
  CheckCircle,
  Circle,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  User,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
  CornerDownRight,
  BookOpen,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";

export default function WorkflowPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State for adding/editing step
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);
  const [parentStepId, setParentStepId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "",
    notes: "",
    resources: "",
    isCompleted: false,
  });

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/workflow`);
      if (res.ok) {
        const data = await res.json();
        setWorkflow(data);
      }
    } catch (e) {
      console.error("Failed to load workflow:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchWorkflow();
  }, [projectId]);

  // Open modal for root step or substep
  const handleOpenAdd = (parentId: string | null = null) => {
    setEditingStep(null);
    setParentStepId(parentId);
    setFormData({
      title: "",
      description: "",
      assignee: "",
      notes: "",
      resources: "",
      isCompleted: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (step: any) => {
    setEditingStep(step);
    setParentStepId(step.parentId || null);
    setFormData({
      title: step.title || "",
      description: step.description || "",
      assignee: step.assignee || "",
      notes: step.notes || "",
      resources: step.resources || "",
      isCompleted: step.isCompleted || false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    try {
      if (editingStep) {
        // Edit step
        const res = await fetch(
          `/api/projects/${projectId}/workflow/steps/${editingStep.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        if (res.ok) {
          setModalOpen(false);
          await fetchWorkflow();
        }
      } else {
        // Add step or substep
        const res = await fetch(`/api/projects/${projectId}/workflow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            parentId: parentStepId,
          }),
        });
        if (res.ok) {
          setModalOpen(false);
          await fetchWorkflow();
        }
      }
    } catch (e) {
      console.error("Failed to submit workflow step:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (step: any) => {
    const nextState = !step.isCompleted;
    try {
      // Optimistic update
      setWorkflow((prev: any) => {
        if (!prev) return prev;
        const updateStepInList = (steps: any[]): any[] =>
          steps.map((s) => {
            if (s.id === step.id) return { ...s, isCompleted: nextState };
            if (s.children) return { ...s, children: updateStepInList(s.children) };
            return s;
          });
        return { ...prev, steps: updateStepInList(prev.steps) };
      });

      await fetch(`/api/projects/${projectId}/workflow/steps/${step.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: nextState }),
      });
    } catch (e) {
      console.error("Failed to toggle completion:", e);
      fetchWorkflow();
    }
  };

  const handleDelete = async (stepId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete step "${title}"?`)) return;
    try {
      const res = await fetch(
        `/api/projects/${projectId}/workflow/steps/${stepId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        await fetchWorkflow();
      }
    } catch (e) {
      console.error("Failed to delete step:", e);
    }
  };

  const handleMove = async (stepId: string, direction: "up" | "down", parentId: string | null) => {
    if (!workflow?.steps) return;

    const list = parentId
      ? workflow.steps.find((s: any) => s.id === parentId)?.children || []
      : workflow.steps.filter((s: any) => !s.parentId);

    const idx = list.findIndex((s: any) => s.id === stepId);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === list.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const reordered = [...list];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);

    const items = reordered.map((s: any, i: number) => ({
      id: s.id,
      order: i + 1,
      parentId,
    }));

    try {
      await fetch(`/api/projects/${projectId}/workflow/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      await fetchWorkflow();
    } catch (e) {
      console.error("Failed to reorder steps:", e);
    }
  };

  // Compute total completion metrics
  const allSteps: any[] = [];
  if (workflow?.steps) {
    workflow.steps.forEach((s: any) => {
      allSteps.push(s);
      if (s.children) allSteps.push(...s.children);
    });
  }
  const completedCount = allSteps.filter((s) => s.isCompleted).length;
  const totalCount = allSteps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter root steps (parentId is null)
  const rootSteps = (workflow?.steps || []).filter((s: any) => !s.parentId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-slate-900/40 to-slate-900/20 dark:from-rose-950/40 dark:via-[#111422] dark:to-[#0c0e15] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ListTree className="h-48 w-48 text-rose-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold tracking-wider">
                CORE EXECUTION BLUEPRINT
              </span>
              <span className="text-xs text-rose-300/80">Zero to Shipped</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
              Final Executable Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              If a new team member joined right now, could they follow this workflow and execute the entire project from scratch?
            </p>
          </div>

          <button
            onClick={() => handleOpenAdd(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 shrink-0 self-start md:self-center"
          >
            <Plus className="h-4 w-4" /> Add Workflow Step
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-rose-500/20">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-rose-400" /> Execution Velocity
            </span>
            <span>
              {completedCount} of {totalCount} steps completed ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Steps Container */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading execution workflow...</p>
        </div>
      ) : rootSteps.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-[#22283a] p-8">
          <ListTree className="h-10 w-10 text-rose-400 mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No workflow steps defined
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Construct the master execution steps so anyone can reproduce and ship the project.
          </p>
          <button
            onClick={() => handleOpenAdd(null)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Step 1
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rootSteps.map((step: any, index: number) => {
            const substeps = step.children || [];
            const isCompleted = step.isCompleted;

            return (
              <div
                key={step.id}
                className={`rounded-xl border transition-all ${
                  isCompleted
                    ? "border-emerald-500/30 bg-emerald-950/5 dark:bg-[#0c1214]"
                    : "border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420]"
                } shadow-xs p-5`}
              >
                {/* Root Step Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(step)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                      title={isCompleted ? "Mark incomplete" : "Mark completed"}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`font-bold text-sm sm:text-base ${
                            isCompleted
                              ? "line-through text-slate-400 dark:text-slate-500"
                              : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {step.title}
                        </h3>

                        {step.assignee && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1b2030] text-slate-600 dark:text-slate-300 font-medium">
                            <User className="h-3 w-3 text-slate-400" /> {step.assignee}
                          </span>
                        )}
                      </div>

                      {step.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      )}

                      {/* Notes & Resources */}
                      {(step.notes || step.resources) && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b0d14] border border-slate-100 dark:border-[#191d2c] text-xs space-y-1">
                          {step.notes && (
                            <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                              <FileText className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <span className="text-[11px]">{step.notes}</span>
                            </div>
                          )}
                          {step.resources && (
                            <div className="flex items-center gap-1.5 text-blue-500 text-[11px] truncate">
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              <a
                                href={step.resources}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline truncate"
                              >
                                {step.resources}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMove(step.id, "up", null)}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(step.id, "down", null)}
                      disabled={index === rootSteps.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenAdd(step.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-rose-500 hover:bg-rose-500/10"
                      title="Add Substep"
                    >
                      <Plus className="h-3 w-3" /> Substep
                    </button>
                    <button
                      onClick={() => handleOpenEdit(step)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Edit Step"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(step.id, step.title)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500"
                      title="Delete Step"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Substeps Indented List */}
                {substeps.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1a1e2f] space-y-2 pl-4 sm:pl-7 border-l-2 border-slate-200 dark:border-[#202538] ml-2.5">
                    {substeps.map((sub: any, subIdx: number) => {
                      const isSubCompleted = sub.isCompleted;

                      return (
                        <div
                          key={sub.id}
                          className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                            isSubCompleted
                              ? "border-emerald-500/20 bg-emerald-950/10"
                              : "border-slate-100 dark:border-[#1a1e2f] bg-slate-50/70 dark:bg-[#0c0e16]"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleComplete(sub)}
                              className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                              title={isSubCompleted ? "Mark incomplete" : "Mark complete"}
                            >
                              {isSubCompleted ? (
                                <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4
                                  className={`text-xs font-semibold ${
                                    isSubCompleted
                                      ? "line-through text-slate-400"
                                      : "text-slate-800 dark:text-slate-200"
                                  }`}
                                >
                                  {sub.title}
                                </h4>

                                {sub.assignee && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-[#1a1f30] text-slate-600 dark:text-slate-300">
                                    <User className="h-2.5 w-2.5 text-slate-400" /> {sub.assignee}
                                  </span>
                                )}
                              </div>

                              {sub.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                  {sub.description}
                                </p>
                              )}

                              {(sub.notes || sub.resources) && (
                                <div className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                                  {sub.notes && <div>• {sub.notes}</div>}
                                  {sub.resources && (
                                    <a
                                      href={sub.resources}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-500 hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-2.5 w-2.5" /> {sub.resources}
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleMove(sub.id, "up", step.id)}
                              disabled={subIdx === 0}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleMove(sub.id, "down", step.id)}
                              disabled={subIdx === substeps.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(sub)}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Edit Substep"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id, sub.title)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500"
                              title="Delete Substep"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Step Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingStep
            ? parentStepId
              ? "Edit Substep"
              : "Edit Workflow Step"
            : parentStepId
            ? "Add Substep"
            : "Add Workflow Step"
        }
        description="Define unambiguous, reproducible instructions so anyone can execute this phase."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Step Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={parentStepId ? "e.g. 2.1 Verify Docker container daemon" : "e.g. 2. Environment Setup"}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="e.g. Rahul Verma"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isCompleted}
                  onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                Mark as Completed
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Execution Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed step-by-step instructions..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Environment Constraints
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Requires 12GB free disk and Python 3.11"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attached Resource or Documentation URL
            </label>
            <input
              type="url"
              value={formData.resources}
              onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
              placeholder="https://..."
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
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {editingStep ? "Save Step" : "Add Step"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
