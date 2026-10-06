"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Lightbulb,
  Link2,
  GitCommit,
  CheckSquare,
  ListTree,
  Edit2,
  Check,
  Activity as ActivityIcon,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    problem: "",
    goal: "",
    currentStatus: "",
  });

  const loadProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setForm({
          name: data.name || "",
          description: data.description || "",
          problem: data.problem || "",
          goal: data.goal || "",
          currentStatus: data.currentStatus || "",
        });
      }
    } catch (e) {
      console.error("Failed to load project:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsEditing(false);
        await loadProject();
      }
    } catch (e) {
      console.error("Failed to save project details:", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading project overview...</p>
      </div>
    );
  }

  const activities = project.activities || [];
  const decisions = project.decisions || [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1d2235] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold">
              Project Overview
            </span>
            <span className="text-xs text-slate-400">• Single Source of Truth</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            {project.name}
          </h2>
        </div>

        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
            isEditing
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#121520] hover:bg-slate-50 dark:hover:bg-[#191d2c] text-slate-700 dark:text-slate-200"
          }`}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isEditing ? (
            <>
              <Check className="h-3.5 w-3.5" /> Save Changes
            </>
          ) : (
            <>
              <Edit2 className="h-3.5 w-3.5 text-blue-500" /> Edit Overview
            </>
          )}
        </button>
      </div>

      {/* Editable Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Project Description */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              What are we building?
            </span>
          </div>
          {isEditing ? (
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-[#262c3f] bg-slate-50 dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden"
            />
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.description || "No project description defined yet."}
            </p>
          )}
        </div>

        {/* Current Status */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Current Status
            </span>
          </div>
          {isEditing ? (
            <textarea
              rows={3}
              value={form.currentStatus}
              onChange={(e) => setForm({ ...form, currentStatus: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-[#262c3f] bg-slate-50 dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden"
            />
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {project.currentStatus || "No current status update posted."}
            </p>
          )}
        </div>

        {/* Problem */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Problem (What problem are we solving?)
            </span>
          </div>
          {isEditing ? (
            <textarea
              rows={3}
              value={form.problem}
              onChange={(e) => setForm({ ...form, problem: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-[#262c3f] bg-slate-50 dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden"
            />
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.problem || "No problem statement specified."}
            </p>
          )}
        </div>

        {/* Goal */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Goal (What does success look like?)
            </span>
          </div>
          {isEditing ? (
            <textarea
              rows={3}
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-[#262c3f] bg-slate-50 dark:bg-[#0c0e16] text-slate-900 dark:text-slate-100 focus:outline-hidden"
            />
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {project.goal || "No success metric or goal specified."}
            </p>
          )}
        </div>
      </div>

      {/* Quick Access Tiles to Sections */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Knowledge Base Navigation
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Resources", href: "resources", icon: FileText, color: "text-blue-500", count: project._count?.resources },
            { label: "Ideas", href: "ideas", icon: Lightbulb, color: "text-amber-500", count: project._count?.ideas },
            { label: "Links", href: "links", icon: Link2, color: "text-cyan-500", count: project._count?.links },
            { label: "Decisions", href: "decisions", icon: GitCommit, color: "text-purple-500", count: project._count?.decisions },
            { label: "Tasks", href: "tasks", icon: CheckSquare, color: "text-emerald-500", count: project._count?.tasks },
            { label: "Workflow", href: "workflow", icon: ListTree, color: "text-rose-500", count: "RUN" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={`/projects/${projectId}/${item.href}`}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420] hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1a1e2f] text-slate-600 dark:text-slate-400">
                    {item.count}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 group-hover:text-blue-500 flex items-center justify-between">
                  {item.label} <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Important Decisions & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Important Decisions */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420] shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#1a1e2e]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <GitCommit className="h-4 w-4" /> Important Decisions
            </h3>
            <Link
              href={`/projects/${projectId}/decisions`}
              className="text-xs font-medium text-blue-500 hover:underline"
            >
              View all
            </Link>
          </div>

          {decisions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No decisions logged yet.</p>
          ) : (
            <div className="space-y-3">
              {decisions.map((d: any) => (
                <div
                  key={d.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-[#181c2b] bg-slate-50/50 dark:bg-[#0c0e16]/60 hover:bg-slate-100 dark:hover:bg-[#161a29] transition-colors"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {d.decision}
                  </div>
                  {d.chosenSolution && (
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      <strong className="text-slate-700 dark:text-slate-300">Solution:</strong> {d.chosenSolution}
                    </div>
                  )}
                  <div className="text-[10px] text-purple-400 mt-1.5 flex items-center justify-between">
                    <span>Decided by {d.madeBy || "Team"}</span>
                    <span>{formatTimeAgo(d.date || d.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-[#1e2335] bg-white dark:bg-[#111420] shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-[#1a1e2e]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <ActivityIcon className="h-4 w-4" /> Recent Activity
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Audit Trail</span>
          </div>

          {activities.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No activity recorded yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {activities.map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 py-1 border-b border-slate-100 dark:border-[#161928] last:border-none"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{a.user}</span>{" "}
                      <span className="text-slate-500">{a.action}</span>{" "}
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        &ldquo;{a.entityTitle}&rdquo;
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {formatTimeAgo(a.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
