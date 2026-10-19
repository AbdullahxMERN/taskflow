"use client";

import React, { useState } from "react";
import { useTaskFlow } from "@/context/TaskContext";

export default function TaskAssignmentModal() {
  const {
    assigningTaskId,
    setAssigningTaskId,
    tasks,
    team,
    handleAddTeamMember,
    handleAssignTask,
    handleUnassignTask,
    calculateMemberWorkload
  } = useTaskFlow();

  const [customName, setCustomName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!assigningTaskId) return null;

  const currentTask = tasks.find((t) => t.id === assigningTaskId);
  if (!currentTask) return null;

  const handleCustomAssign = (e) => {
    if (e) e.preventDefault();
    if (!customName.trim()) return;

    const clean = customName.trim();
    const initials = clean
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

    const customMember = {
      id: `usr-${clean.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      name: clean,
      initials,
      role: "Team Contributor",
      department: "General Squad",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clean)}&backgroundColor=4648d4,7c3aed,db2777`,
      isOnline: true,
      capacity: 5,
      email: `${clean.toLowerCase().replace(/\s+/g, ".")}@taskflow.io`
    };

    handleAddTeamMember(customMember);
    handleAssignTask(currentTask.id, customMember);
    setCustomName("");
    setShowCustomInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setAssigningTaskId(null)}
      />

      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 flex-shrink-0">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              Task Assignment
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-1">
              {currentTask.title}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Current:{" "}
              <span className="font-semibold text-slate-800">
                {currentTask.assigneeName || "Unassigned"}
              </span>
            </p>
          </div>
          <button
            onClick={() => setAssigningTaskId(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            Assign to Squad Member
          </p>

          {team.map((member) => {
            const isAssigned = currentTask.assigneeId === member.id;
            const workload = calculateMemberWorkload(member.id);

            return (
              <button
                key={member.id}
                onClick={() => handleAssignTask(currentTask.id, member)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left active:scale-[0.99] ${
                  isAssigned
                    ? "bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200"
                    : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-9 h-9 flex-shrink-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full ring-2 ring-slate-100"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        member.isOnline ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {member.name}
                      </span>
                      {isAssigned && (
                        <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{member.role}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      workload.totalAssigned === 0
                        ? "bg-slate-100 text-slate-600"
                        : workload.doneCount === workload.totalAssigned
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {workload.totalAssigned === 0
                      ? "0 tasks"
                      : `${workload.doneCount}/${workload.totalAssigned} done`}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {workload.completionPercentage}% done
                  </span>
                </div>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 space-y-2">
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-violet-300 text-violet-700 hover:bg-violet-50 text-xs font-semibold transition-all active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Assign Custom Name...</span>
              </button>
            ) : (
              <form onSubmit={handleCustomAssign} className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter person's name (e.g. David)"
                  className="flex-1 h-9 px-3 rounded-xl bg-violet-50 border border-violet-300 text-xs text-slate-900 font-medium outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="h-9 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold transition-all"
                >
                  Assign
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomName("");
                  }}
                  className="h-9 px-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  Cancel
                </button>
              </form>
            )}

            <button
              onClick={() => handleUnassignTask(currentTask.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 text-xs font-semibold transition-all active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[16px]">person_off</span>
              <span>Remove Assignee (Mark Unassigned)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
