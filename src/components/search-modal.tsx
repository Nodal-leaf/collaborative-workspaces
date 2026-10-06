"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, FileText, Lightbulb, Link2, GitCommit, CheckSquare, ListTree, ArrowRight, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ projectId, isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    resources: any[];
    ideas: any[];
    links: any[];
    decisions: any[];
    tasks: any[];
    workflowSteps: any[];
    total: number;
  }>({
    resources: [],
    ideas: [],
    links: [],
    decisions: [],
    tasks: [],
    workflowSteps: [],
    total: 0,
  });

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({
        resources: [],
        ideas: [],
        links: [],
        decisions: [],
        tasks: [],
        workflowSteps: [],
        total: 0,
      });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/search?q=${encodeURIComponent(query)}&type=${activeTab}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, activeTab, projectId]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(`/projects/${projectId}/${path}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-slate-200 dark:border-[#22283a] bg-white dark:bg-[#111420] shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-[#1d2233]">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across resources, ideas, links, decisions, tasks, workflow..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />}
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1e2e]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-[#1d2233] bg-slate-50 dark:bg-[#0c0e16] overflow-x-auto text-xs">
          {[
            { id: "ALL", label: "All Items" },
            { id: "RESOURCE", label: "Resources" },
            { id: "IDEA", label: "Ideas" },
            { id: "LINK", label: "Links" },
            { id: "DECISION", label: "Decisions" },
            { id: "TASK", label: "Tasks" },
            { id: "WORKFLOW", label: "Workflow" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!query.trim() && (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Type anything to search across the entire project source of truth.
              <div className="mt-2 text-xs text-slate-500">
                Examples: <span className="font-mono text-blue-400">RAG</span>, <span className="font-mono text-blue-400">sandbox</span>, <span className="font-mono text-blue-400">MCP</span>, <span className="font-mono text-blue-400">evaluation</span>
              </div>
            </div>
          )}

          {query.trim() && !loading && results.total === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching items found for &ldquo;{query}&rdquo;.
            </div>
          )}

          {/* Resources */}
          {results.resources?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-400" /> Resources ({results.resources.length})
              </div>
              <div className="space-y-1">
                {results.resources.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo("resources")}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1e2f] group transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-500">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{item.description}</div>
                      <div className="text-[11px] text-blue-400 mt-0.5">{item.category} • {item.author || "Team"}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ideas */}
          {results.ideas?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> Ideas ({results.ideas.length})
              </div>
              <div className="space-y-1">
                {results.ideas.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo("ideas")}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1e2f] group transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-amber-500">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{item.description}</div>
                      <div className="text-[11px] text-amber-400 mt-0.5">Status: {item.status} • {item.contributor}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {results.links?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-cyan-400" /> Links ({results.links.length})
              </div>
              <div className="space-y-1">
                {results.links.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo("links")}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1e2f] group transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-cyan-500">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{item.url}</div>
                      <div className="text-[11px] text-cyan-400 mt-0.5">{item.category}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Decisions */}
          {results.decisions?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <GitCommit className="h-3.5 w-3.5 text-purple-400" /> Decisions ({results.decisions.length})
              </div>
              <div className="space-y-1">
                {results.decisions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo("decisions")}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1e2f] group transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-purple-400">
                        {item.decision}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{item.context || item.chosenSolution}</div>
                      <div className="text-[11px] text-purple-400 mt-0.5">Decided by: {item.madeBy}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {results.tasks?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5 text-emerald-400" /> Tasks ({results.tasks.length})
              </div>
              <div className="space-y-1">
                {results.tasks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo("tasks")}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1e2f] group transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-emerald-400">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{item.description}</div>
                      <div className="text-[11px] text-emerald-400 mt-0.5">Status: {item.status} • Assignee: {item.assignee || "Unassigned"}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Workflow Steps */}
          {results.workflowSteps?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <ListTree className="h-3.5 w-3.5 text-rose-400" /> Final Executable Workflow Steps ({results.workflowSteps.length})
              </div>
              <div className="space-y-1">
                {results.workflowSteps.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo("workflow")}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a1e2f] group transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-rose-400">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-1">{item.description || item.notes}</div>
                      <div className="text-[11px] text-rose-400 mt-0.5">
                        {item.isCompleted ? "✓ Completed" : "○ Pending"} • Assignee: {item.assignee || "None"}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-[#1d2233] bg-slate-50 dark:bg-[#0c0e16] text-[11px] text-slate-500">
          <span>Tip: Press ESC to exit search</span>
          <span>{results.total} results found</span>
        </div>
      </div>
    </div>
  );
}
