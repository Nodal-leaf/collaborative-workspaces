"use client";

import React, { useState } from "react";
import { Modal } from "./ui/modal";
import { Copy, Check, Globe, Shield, RefreshCw } from "lucide-react";

interface ShareModalProps {
  projectId: string;
  shareToken: string;
  initialAccess: string; // "VIEW" | "EDIT"
  isOpen: boolean;
  onClose: () => void;
  onAccessChange?: (newAccess: string) => void;
}

export function ShareModal({
  projectId,
  shareToken,
  initialAccess = "VIEW",
  isOpen,
  onClose,
  onAccessChange,
}: ShareModalProps) {
  const [access, setAccess] = useState(initialAccess);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form public share URL
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const shareUrl = `${origin}/share/${shareToken}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateAccessLevel = async (newLevel: "VIEW" | "EDIT") => {
    setAccess(newLevel);
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareAccess: newLevel }),
      });
      if (res.ok) {
        onAccessChange?.(newLevel);
      }
    } catch (e) {
      console.error("Failed to update access level:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Project Workspace"
      description="Anyone with this unique link can access the single source of truth."
    >
      <div className="space-y-5">
        {/* Link Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Shareable URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-[#262c3f] bg-slate-50 dark:bg-[#0c0e16] text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Access Level Selector */}
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-[#22283a] bg-slate-50/50 dark:bg-[#0c0e16]/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                General Access
              </span>
            </div>
            {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />}
          </div>

          <div className="space-y-2 mt-3">
            <label className="flex items-start gap-3 p-2.5 rounded-md border border-transparent hover:bg-slate-100 dark:hover:bg-[#181c2b] cursor-pointer transition-colors">
              <input
                type="radio"
                name="access"
                value="VIEW"
                checked={access === "VIEW"}
                onChange={() => updateAccessLevel("VIEW")}
                className="mt-0.5 text-blue-600"
              />
              <div>
                <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                  Viewer
                </div>
                <div className="text-[11px] text-slate-500">
                  Anyone with the link can view all notes, resources, tasks, decisions, and the workflow.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-2.5 rounded-md border border-transparent hover:bg-slate-100 dark:hover:bg-[#181c2b] cursor-pointer transition-colors">
              <input
                type="radio"
                name="access"
                value="EDIT"
                checked={access === "EDIT"}
                onChange={() => updateAccessLevel("EDIT")}
                className="mt-0.5 text-blue-600"
              />
              <div>
                <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                  Collaborator (Edit Access)
                </div>
                <div className="text-[11px] text-slate-500">
                  Anyone with the link can add resources, submit ideas, move tasks, and update workflow steps.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            Link access is secured via unguessable 128-bit cryptographic tokens. You can change access levels or regenerate tokens anytime.
          </span>
        </div>
      </div>
    </Modal>
  );
}
