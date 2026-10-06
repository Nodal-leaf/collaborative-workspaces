"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CheckSquare,
  Plus,
  Search,
  Kanban,
  List as ListIcon,
  Edit2,
  Trash2,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

const TASK_STATUSES = ["Backlog", "Todo", "In Progress", "Blocked", "Done"];
const TASK_PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const PRIORITY_BADGES: Record<string, { bg: string; text: string }> = {
  Low: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-500 dark:text-slate-400" },
  Medium: { bg: "bg-blue-500/10", text: "text-blue-500" },
  High: { bg: "bg-amber-500/10", text: "text-amber-500" },
  Urgent: { bg: "bg-rose-500/10", text: "text-rose-500 font-semibold" },
};

export default function TasksPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "",
    status: "Todo",
    priority: "Medium",
    dueDate: "",
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const url = `/api/projects/${projectId}/tasks?search=${encodeURIComponent(
        search
      )}&priority=${encodeURIComponent(priorityFilter)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error("Failed to load tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchTasks();
  }, [projectId, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleOpenAdd = (defaultStatus = "Todo") => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      assignee: "",
      status: defaultStatus,
      priority: "Medium",
      dueDate: "",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      assignee: task.assignee || "",
      status: task.status || "Todo",
      priority: task.priority || "Medium",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    try {
      const endpoint = editingTask
        ? `/api/projects/${projectId}/tasks/${editingTask.id}`
        : `/api/projects/${projectId}/tasks`;
      const method = editingTask ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalOpen(false);
        await fetchTasks();
      }
    } catch (e) {
      console.error("Failed to save task:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error("Failed to update status:", e);
      fetchTasks();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete task "${title}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete task:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1d2235]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
              Execution Board
            </span>
            <span className="text-xs text-slate-400">({tasks.length} tasks)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Tasks & Milestones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lightweight task tracking with Kanban and List views to keep the team aligned on deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#111420]">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === "kanban"
                  ? "bg-slate-100 dark:bg-[#1f2438] text-slate-900 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Kanban className="h-3.5 w-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-slate-100 dark:bg-[#1f2438] text-slate-900 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" /> List
            </button>
          </div>

          <button
            onClick={() => handleOpenAdd("Todo")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, description, assignee..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#111420] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </form>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] uppercase font-semibold">Priority:</span>
          {["All", ...TASK_PRIORITIES].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                priorityFilter === p
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#111420] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#191d2c]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading task board...</p>
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
          {TASK_STATUSES.map((colStatus) => {
            const colTasks = tasks.filter((t) => t.status === colStatus);

            return (
              <div
                key={colStatus}
                className="flex flex-col rounded-xl border border-slate-200 dark:border-[#1c2132] bg-slate-100/50 dark:bg-[#0c0e15] min-w-[210px] p-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-[#1a1e2e]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {colStatus}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#1a1f30] text-slate-600 dark:text-slate-400 font-semibold">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenAdd(colStatus)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-[#1a1f30]"
                    title={`Add task to ${colStatus}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Column Task Cards */}
                <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[65vh] pr-0.5">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 dark:border-[#1c2132] rounded-lg">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const priorityStyle = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Medium;

                      return (
                        <div
                          key={task.id}
                          className="group relative rounded-lg border border-slate-200 dark:border-[#202538] bg-white dark:bg-[#121522] p-3 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priorityStyle.bg} ${priorityStyle.text}`}
                              >
                                {task.priority}
                              </span>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEdit(task)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  title="Edit"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(task.id, task.title)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-500"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                              {task.title}
                            </h4>

                            {task.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#191d2c] flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1 truncate max-w-[100px]">
                              <User className="h-3 w-3 shrink-0" />
                              <span className="truncate">{task.assignee || "Unassigned"}</span>
                            </span>

                            {task.dueDate && (
                              <span className="flex items-center gap-1 shrink-0">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>

                          {/* Move to next column quick shortcut */}
                          <div className="mt-2 pt-1 border-t border-slate-100 dark:border-[#191d2c] flex items-center justify-between">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className="text-[10px] bg-transparent text-slate-500 dark:text-slate-400 cursor-pointer focus:outline-hidden"
                            >
                              {TASK_STATUSES.map((s) => (
                                <option key={s} value={s} className="dark:bg-[#121522]">
                                  Move: {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-xl border border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420] overflow-hidden shadow-xs">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-slate-200 dark:border-[#1a1e2e] bg-slate-50 dark:bg-[#0c0e16] text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
            <div className="col-span-5">Task</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#181c2b]">
            {tasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No tasks found</div>
            ) : (
              tasks.map((task) => {
                const priorityStyle = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.Medium;

                return (
                  <div
                    key={task.id}
                    className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-slate-50/70 dark:hover:bg-[#161a29] transition-colors text-xs"
                  >
                    <div className="col-span-5">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-[11px] text-slate-500 truncate">{task.description}</div>
                      )}
                    </div>

                    <div className="col-span-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-[11px] px-2 py-0.5 rounded border border-slate-200 dark:border-[#262c3f] bg-slate-50 dark:bg-[#0c0e16] text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                      >
                        {TASK_STATUSES.map((s) => (
                          <option key={s} value={s} className="dark:bg-[#111420]">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${priorityStyle.bg} ${priorityStyle.text}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="col-span-2 text-slate-600 dark:text-slate-300 truncate">
                      {task.assignee || "Unassigned"}
                    </div>

                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(task)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Edit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id, task.title)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? "Edit Task" : "Add Task"}
        description="Assign actionable work to maintain project velocity."
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
              placeholder="e.g. Implement self-reflection evaluation harness"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="e.g. Sarah Chen"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Details on what needs to be delivered..."
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
              {editingTask ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
