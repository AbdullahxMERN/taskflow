"use client";

import React from "react";
import { useTaskFlow } from "@/context/TaskContext";

export default function BottomNav() {
  const { activeTab, setActiveTab, setIsCreateModalOpen } = useTaskFlow();

  const navItems = [
    { id: "overview", label: "Overview", icon: "grid_view" },
    { id: "board", label: "Board", icon: "view_kanban" },
    { id: "team", label: "Team", icon: "group" },
    { id: "assignment", label: "Tasks", icon: "task_alt" }
  ];

  return (
    <>
      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 z-40 md:hidden">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-12 px-4 rounded-full bg-gradient-to-r from-[#4648d4] to-indigo-600 text-white shadow-[0_8px_20px_-2px_rgba(70,72,212,0.45)] hover:shadow-[0_10px_24px_-2px_rgba(70,72,212,0.55)] active:scale-95 transition-all flex items-center gap-2 text-xs font-semibold ring-2 ring-white"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>New Task</span>
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex justify-around items-center h-15 px-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center min-w-[60px] h-13 gap-0.5 transition-all active:scale-95 ${
                  isActive ? "text-[#4648d4] font-bold" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {isActive && (
                  <span className="absolute top-1 w-5 h-1 rounded-full bg-[#4648d4]" />
                )}
                <span className="material-symbols-outlined text-[22px] mt-1">
                  {item.icon}
                </span>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
