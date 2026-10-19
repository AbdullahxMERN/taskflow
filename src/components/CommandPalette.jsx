"use client";

import React, { useState, useEffect } from "react";
import { useTaskFlow } from "@/context/TaskContext";

export default function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    tasks,
    setActiveTab,
    setEditingTask,
    setIsCreateModalOpen,
    handleClearAllTasks,
    openConfirmModal
  } = useTaskFlow();

  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filtered = query.trim()
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          (t.description || "").toLowerCase().includes(query.toLowerCase()) ||
          (t.projectName || "").toLowerCase().includes(query.toLowerCase())
      )
    : tasks.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-3 sm:px-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-3.5 sm:px-4 py-3.5 border-b border-slate-100 gap-2.5 sm:gap-3 flex-shrink-0">
          <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, navigate views, or run actions..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 font-mono text-[10px] text-slate-500"
          >
            ESC
          </button>
        </div>

        <div className="p-2.5 sm:p-3 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
            Quick Actions
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 mt-1.5">
            <button
              onClick={() => {
                setIsCommandPaletteOpen(false);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-white text-xs font-semibold text-slate-700 transition-all text-left"
            >
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4648d4] flex items-center justify-center">
                <span className="material-symbols-outlined text-[15px]">add</span>
              </span>
              <span>New Task (N)</span>
            </button>

            <button
              onClick={() => {
                setIsCommandPaletteOpen(false);
                setActiveTab("board");
              }}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-white text-xs font-semibold text-slate-700 transition-all text-left"
            >
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[15px]">view_kanban</span>
              </span>
              <span>Open Board (2)</span>
            </button>

            <button
              onClick={() => {
                setIsCommandPaletteOpen(false);
                setActiveTab("team");
              }}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-white text-xs font-semibold text-slate-700 transition-all text-left"
            >
              <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[15px]">group</span>
              </span>
              <span>View Team (3)</span>
            </button>

            <button
              onClick={() => {
                setIsCommandPaletteOpen(false);
                setActiveTab("assignment");
              }}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-white text-xs font-semibold text-slate-700 transition-all text-left"
            >
              <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[15px]">task_alt</span>
              </span>
              <span>View Tasks (4)</span>
            </button>

            {tasks.length > 0 && (
              <button
                onClick={() => {
                  openConfirmModal({
                    title: "Clear All Tasks",
                    message: "Are you sure you want to clear all tasks from the workspace? This action cannot be undone.",
                    confirmText: "Clear All",
                    variant: "danger",
                    onConfirm: () => {
                      setIsCommandPaletteOpen(false);
                      handleClearAllTasks();
                    }
                  });
                }}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-rose-50 text-xs font-semibold text-rose-600 transition-all text-left col-span-1 sm:col-span-2"
              >
                <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                </span>
                <span>Clear All Tasks ({tasks.length})</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-2 max-h-72 overflow-y-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
            Tasks ({filtered.length})
          </span>
          <div className="mt-1 space-y-1">
            {filtered.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center">No tasks matching &quot;{query}&quot;</p>
            ) : (
              filtered.map((task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    setEditingTask(task);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/70 transition-colors text-left group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#4648d4] truncate block">
                      {task.title}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {task.projectName} • {task.assigneeName} • {task.status}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-[16px] group-hover:text-[#4648d4]">
                    arrow_forward
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
