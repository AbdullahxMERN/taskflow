"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTaskFlow } from "@/context/TaskContext";

function formatDueRelative(isoStr) {
  if (!isoStr) return "";
  const diffMs = new Date(isoStr).getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 0) {
    const abs = Math.abs(diffMin);
    if (abs < 60) return `Overdue by ${abs}m`;
    if (abs < 1440) return `Overdue by ${Math.floor(abs / 60)}h`;
    return `Overdue by ${Math.floor(abs / 1440)}d`;
  }
  if (diffMin < 60) return `Due in ${diffMin}m`;
  if (diffMin < 1440) return `Due in ${Math.floor(diffMin / 60)}h`;
  return `Due in ${Math.floor(diffMin / 1440)}d`;
}

const Header = () => {
  const {
    activeTab,
    setActiveTab,
    setIsCommandPaletteOpen,
    setIsCreateModalOpen,
    overdueNotifications,
    metrics,
    setEditingTask,
    handleMarkTaskDone
  } = useTaskFlow();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

  const alertCount = overdueNotifications.length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) return;
      if (e.key === "1") { e.preventDefault(); setActiveTab("overview"); }
      else if (e.key === "2") { e.preventDefault(); setActiveTab("board"); }
      else if (e.key === "3") { e.preventDefault(); setActiveTab("team"); }
      else if (e.key === "4") { e.preventDefault(); setActiveTab("assignment"); }
      else if ((e.key === "n" || e.key === "c") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveTab, setIsCreateModalOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#faf8ff]/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_6px_rgba(15,23,42,0.03)]">
        <div className="w-full max-w-[1920px] mx-auto h-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              onClick={() => setActiveTab("overview")}
              className="cursor-pointer w-9 h-9 rounded-xl bg-gradient-to-br from-[#4648d4] to-[#4b41e1] flex items-center justify-center shadow-md shadow-indigo-500/20 text-white flex-shrink-0 transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">check_box</span>
            </div>
            <div className="flex flex-col truncate">
              <span
                onClick={() => setActiveTab("overview")}
                className="cursor-pointer font-bold text-base sm:text-[17px] tracking-tight text-slate-900 leading-none hover:text-[#4648d4] transition-colors"
              >
                TaskFlow
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate mt-0.5 hidden xs:inline">
                Workspace • Linear Pro
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {[
              { id: "overview",    label: "Overview",   key: "1" },
              { id: "board",       label: "Board",      key: "2" },
              { id: "team",        label: "Team",       key: "3" },
              { id: "assignment",  label: "Tasks",      key: "4" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={`${tab.label} (Press ${tab.key})`}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-white text-[#4648d4] shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#4648d4] hover:bg-[#3b3ecb] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[17px]">add</span>
              <span>New Task</span>
            </button>

            <button
              aria-label="Global Search"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            <div className="relative" ref={notifRef}>
              <button
                aria-label="Notifications"
                onClick={() => setIsNotificationsOpen((v) => !v)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {alertCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 rounded-full bg-rose-500 ring-2 ring-white flex items-center justify-center">
                    {alertCount <= 9 && (
                      <span className="text-[9px] font-bold text-white px-0.5">{alertCount}</span>
                    )}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full mt-1.5 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-rose-500">alarm</span>
                      Finished Deadlines
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      alertCount > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {alertCount} {alertCount === 1 ? "task" : "tasks"} overdue
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto overscroll-contain">
                    {overdueNotifications.length > 0 && (
                      <div className="p-2 space-y-1.5">
                        {overdueNotifications.map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 rounded-xl bg-rose-50/90 border border-rose-100 hover:bg-rose-100/70 transition-all flex items-start justify-between gap-2"
                          >
                            <div
                              onClick={() => {
                                setEditingTask(t);
                                setIsNotificationsOpen(false);
                              }}
                              className="min-w-0 flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-bold text-rose-950 text-xs leading-tight truncate hover:text-[#4648d4] transition-colors">
                                  {t.title}
                                </p>
                                {t.priority === "urgent" && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                                    <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-rose-700 font-bold flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                                  {formatDueRelative(t.dueTimestamp)}
                                </span>
                                {t.assigneeName && t.assigneeName !== "Unassigned" && (
                                  <span className="text-[10px] text-slate-600 bg-white/80 border border-rose-200/60 px-1.5 py-0.2 rounded-full font-semibold truncate max-w-[110px]">
                                    {t.assigneeName}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleMarkTaskDone(t.id)}
                              title="Mark task as Done"
                              className="p-1 px-2 rounded-lg bg-white border border-rose-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 text-[10px] font-bold flex items-center gap-1 flex-shrink-0 transition-colors shadow-2xs active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[13px]">check</span>
                              <span>Done</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {alertCount === 0 && (
                      <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-emerald-500 text-[22px]">check_circle</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800">All clear!</p>
                        <p className="text-[11px] text-slate-500">No tasks with finished or expired deadlines.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex items-center">
              <button
                aria-label="Team Directory"
                onClick={() => setActiveTab("team")}
                title="View Team Directory"
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4648d4] to-violet-500 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center text-white shadow-xs"
              >
                <span className="material-symbols-outlined text-[19px]">group</span>
              </button>
              <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white text-[9px] font-bold w-3 h-3 rounded-full flex items-center justify-center ring-2 ring-white" />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
