"use client";

import React from "react";
import { useTaskFlow } from "@/context/TaskContext";

export default function OverviewView() {
  const {
    tasks,
    team,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    searchQuery,
    setSearchQuery,
    metrics,
    handleToggleTaskStatus,
    setAssigningTaskId,
    setEditingTask,
    setIsCommandPaletteOpen,
    setActiveTab,
    calculateMemberWorkload,
  } = useTaskFlow();

  const displayTasks = tasks
    .filter((t) => {
      if (selectedProjectId !== "all" && t.projectId !== selectedProjectId)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .slice(0, 10);

  const criticalTasks = tasks
    .filter(
      (t) =>
        (t.isOverdue ||
          t.priority === "urgent" ||
          (t.dueDate && t.dueDate.includes("Today"))) &&
        t.status !== "done",
    )
    .slice(0, 4);

  return (
    <div className="flex flex-col w-full space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between pt-1 gap-3">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 truncate">
              Welecome
            </h1>
            <span
              aria-hidden="true"
              className="inline-block origin-bottom-right hover:rotate-12 transition-transform cursor-pointer text-lg sm:text-xl select-none flex-shrink-0"
            >
              ✨
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-slate-500 text-xs mt-1">
            <div className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100/90 px-2 py-0.5 rounded-full border border-slate-200/60 text-[11px] sm:text-xs">
              <span className="material-symbols-outlined text-[13px] sm:text-[14px] text-[#4648d4]">
                calendar_today
              </span>
              <span>Sprint Active</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] sm:text-[11px] font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
              </span>
              <span>Live & Synced</span>
            </div>
            <div className="hidden md:inline-flex items-center gap-1 text-slate-500 text-[11px] font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200">
              <span className="font-semibold text-slate-700">
                {tasks.length}
              </span>{" "}
              total tasks in workspace
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("team")}
          className="relative flex-shrink-0 cursor-pointer group flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4648d4] to-violet-500 flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[18px]">group</span>
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {team.length} Members
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              View Squad
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="relative flex items-center group">
          <span className="material-symbols-outlined absolute left-3.5 text-slate-400 group-focus-within:text-[#4648d4] transition-colors text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions, or project..."
            className="w-full h-11 pl-10 pr-14 bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-[#4648d4] focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
          />
          <div className="absolute right-3 flex items-center gap-1">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 font-mono text-[10px] font-semibold text-slate-500 select-none shadow-2xs hover:bg-slate-100"
            >
              ⌘K
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-nowrap">
          {projects.map((proj) => {
            const isSelected = selectedProjectId === proj.id;
            const projectTaskCount =
              proj.id === "all"
                ? tasks.length
                : tasks.filter((t) => t.projectId === proj.id).length;

            return (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <span>{proj.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {projectTaskCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 xl:gap-5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Tasks
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4648d4] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[17px]">
                task_alt
              </span>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {metrics.total}
            </div>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[14px]">
                trending_up
              </span>
              <span>
                {metrics.total > 0
                  ? `${metrics.completionRate}% completion rate`
                  : "No tasks added yet"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              To Do
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[17px]">
                pending_actions
              </span>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {metrics.todoCount}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="font-medium text-slate-600">
                {metrics.unassignedTodoCount} unassigned
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[17px]">
                hourglass_top
              </span>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              {metrics.inProgressCount}
            </div>
            <div className="flex items-center gap-1 mt-2 text-blue-600 text-[11px] font-semibold">
              <span className="relative flex h-1.5 w-1.5 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600"></span>
              </span>
              <span>Active focus</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[17px]">
                check_circle
              </span>
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight leading-none">
              {metrics.doneCount}
            </div>
            <div className="flex items-center gap-1 mt-2 text-slate-500 text-[11px] font-medium">
              <span className="font-semibold text-emerald-600">
                {metrics.completionRate}%
              </span>
              <span>• Ahead of pace</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col space-y-5 sm:space-y-6">
          <div className="bg-gradient-to-br from-[#3b3ecb] via-[#484adb] to-[#6049e8] rounded-2xl p-4 sm:p-6 text-white shadow-[0_8px_24px_-4px_rgba(70,72,212,0.4)] relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -left-6 -bottom-6 w-40 h-40 rounded-full bg-violet-400/20 blur-xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white/95">
                  <span className="material-symbols-outlined text-[14px]">
                    flag
                  </span>
                  <span>SPRINT VELOCITY</span>
                </div>
                <span className="text-[11px] font-medium bg-black/20 px-2.5 py-0.5 rounded-full text-white/90 border border-white/10 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">
                    task_alt
                  </span>
                  {metrics.total} total tasks
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 mt-4">
                <div className="space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold leading-snug tracking-tight text-white">
                    {metrics.completionRate}% of sprint goal achieved
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80">
                    {metrics.total - metrics.doneCount > 0
                      ? `${metrics.total - metrics.doneCount} task${metrics.total - metrics.doneCount !== 1 ? "s" : ""} remaining to complete`
                      : "All tasks complete — great work! 🎉"}
                  </p>
                </div>

                <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 flex items-center justify-center">
                  <svg
                    className="w-16 h-16 sm:w-18 sm:h-18 transform -rotate-90"
                    viewBox="0 0 48 48"
                  >
                    <circle
                      cx="24"
                      cy="24"
                      fill="none"
                      r="19"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      fill="none"
                      r="19"
                      stroke="#ffffff"
                      strokeDasharray="119.38"
                      strokeDashoffset={
                        119.38 * (1 - metrics.completionRate / 100)
                      }
                      strokeLinecap="round"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-sm sm:text-base font-extrabold text-white leading-none">
                      {metrics.completionRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-white/15 grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="flex flex-col items-center py-2 px-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-[10px] font-medium text-white/70">
                    Completed
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    {metrics.doneCount} Done
                  </span>
                </div>
                <div className="flex flex-col items-center py-2 px-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-[10px] font-medium text-white/70">
                    In Flight
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    {metrics.inProgressCount} Active
                  </span>
                </div>
                <div className="flex flex-col items-center py-2 px-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-[10px] font-medium text-white/70">
                    Backlog
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    {metrics.backlogCount} Pending
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#4648d4]">
                  format_list_bulleted
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Recent Tasks & Sprint Backlog
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#4648d4] bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                Showing {displayTasks.length} tasks
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {displayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[28px] text-[#4648d4]">
                      add_task
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    No tasks yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-[260px]">
                    Create your first task to get started. Use the + button or
                    press{" "}
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] font-bold">
                      N
                    </kbd>{" "}
                    to create one.
                  </p>
                </div>
              ) : (
                displayTasks.map((task) => {
                  const isDone = task.status === "done";
                  const assigneeMember = team.find(
                    (m) => m.id === task.assigneeId,
                  );
                  const subtasks = task.subtasks || [];
                  const completedSubs = subtasks.filter(
                    (s) => s.completed,
                  ).length;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setEditingTask(task)}
                      className={`task-row flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors select-none cursor-pointer ${
                        isDone ? "bg-slate-50/50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleTaskStatus(task.id);
                          }}
                          title={`Status: ${task.status === "inprogress" ? "In Progress" : task.status === "done" ? "Done" : "To Do"}. Click to cycle.`}
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-white transition-all active:scale-90 flex-shrink-0 ${
                            task.status === "done"
                              ? "bg-emerald-500 border-2 border-emerald-500"
                              : task.status === "inprogress"
                                ? "bg-blue-600 border-2 border-blue-600"
                                : "bg-white border-2 border-slate-300 hover:border-[#4648d4]"
                          }`}
                        >
                          {task.status === "done" && (
                            <span className="material-symbols-outlined text-[14px]">
                              check
                            </span>
                          )}
                          {task.status === "inprogress" && (
                            <span className="material-symbols-outlined text-[13px] text-white">
                              hourglass_top
                            </span>
                          )}
                        </button>

                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[13px] sm:text-[14px] font-semibold truncate leading-tight ${
                                isDone
                                  ? "line-through text-slate-400"
                                  : "text-slate-900"
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                            <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                              {task.projectName}
                            </span>
                            <span>•</span>
                            {subtasks.length > 0 && (
                              <>
                                <span className="font-mono text-slate-600 font-semibold">
                                  {completedSubs}/{subtasks.length} subs
                                </span>
                                <span>•</span>
                              </>
                            )}
                            {isDone ? (
                              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[13px]">
                                  done_all
                                </span>
                                Done
                              </span>
                            ) : (
                              <span
                                className={`font-semibold flex items-center gap-1 ${
                                  task.status === "inprogress"
                                    ? "text-[#4648d4]"
                                    : "text-amber-600"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    task.status === "inprogress"
                                      ? "bg-[#4648d4]"
                                      : "bg-amber-500"
                                  }`}
                                />
                                {task.status === "inprogress"
                                  ? "In Progress"
                                  : "To Do"}
                              </span>
                            )}
                            <span>•</span>
                            <span>Due {task.dueDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssigningTaskId(task.id);
                          }}
                          className="p-1 rounded-full hover:ring-2 hover:ring-indigo-300 transition-all"
                          title={`Assigned to: ${task.assigneeName}. Click to change assignee.`}
                        >
                          {assigneeMember ? (
                            <img
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                              src={assigneeMember.avatar}
                              alt={assigneeMember.name}
                            />
                          ) : task.assigneeName &&
                            task.assigneeName !== "Unassigned" ? (
                            <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-[10px] ring-1 ring-violet-200">
                              {task.assigneeName.slice(0, 2).toUpperCase()}
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center text-[10px]">
                              ?
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col space-y-5 sm:space-y-6">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Critical Deadlines
                </h2>
              </div>
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                {criticalTasks.length} urgent
              </span>
            </div>

            <div className="space-y-2.5">
              {criticalTasks.length === 0 && (
                <div className="flex flex-col items-center py-6 text-center">
                  <span className="material-symbols-outlined text-[24px] text-emerald-400 mb-2">
                    verified
                  </span>
                  <p className="text-xs text-slate-500 font-medium">
                    No urgent deadlines — you're on track!
                  </p>
                </div>
              )}
              {criticalTasks.map((ct) => {
                const assigneeMember = team.find((m) => m.id === ct.assigneeId);
                const isOverdue =
                  ct.isOverdue ||
                  (ct.dueDate && ct.dueDate.includes("Overdue"));

                return (
                  <div
                    key={ct.id}
                    className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all relative overflow-hidden group bg-slate-50/50"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 ${
                        isOverdue ? "bg-rose-500" : "bg-amber-400"
                      }`}
                    />
                    <div className="flex items-start gap-2.5 pl-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`px-2 py-0.2 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                              isOverdue
                                ? "bg-rose-50 text-rose-700 border-rose-200/60"
                                : "bg-amber-50 text-amber-800 border-amber-200/60"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOverdue ? "bg-rose-500" : "bg-amber-400"
                              }`}
                            />
                            {ct.dueDate}
                          </span>
                          <span className="text-[10px] font-bold text-rose-700 uppercase font-mono">
                            {ct.priority}
                          </span>
                        </div>

                        <p
                          onClick={() => setEditingTask(ct)}
                          className="cursor-pointer font-bold text-slate-900 text-xs leading-snug truncate hover:text-[#4648d4] transition-colors"
                        >
                          {ct.title}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 text-slate-500 text-[10px]">
                          <span className="font-medium text-slate-600">
                            {ct.projectName}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssigningTaskId(ct.id);
                            }}
                            className="flex items-center gap-1 font-semibold hover:text-[#4648d4]"
                          >
                            {assigneeMember ? (
                              <>
                                <img
                                  src={assigneeMember.avatar}
                                  alt={assigneeMember.name}
                                  className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-slate-200"
                                />
                                <span>{assigneeMember.name.split(" ")[0]}</span>
                              </>
                            ) : ct.assigneeName &&
                              ct.assigneeName !== "Unassigned" ? (
                              <>
                                <span className="w-3.5 h-3.5 rounded-full bg-violet-600 text-white font-bold text-[9px] flex items-center justify-center">
                                  {ct.assigneeName[0].toUpperCase()}
                                </span>
                                <span>{ct.assigneeName.split(" ")[0]}</span>
                              </>
                            ) : (
                              <span className="text-rose-600 font-bold">
                                + Assign
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4648d4] text-[18px]">
                  group
                </span>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Squad Progress Pulse
                </h2>
              </div>
              <button
                onClick={() => setActiveTab("team")}
                className="text-[11px] font-bold text-[#4648d4] hover:underline"
              >
                View Directory →
              </button>
            </div>

            <div className="space-y-3">
              {team.map((member) => {
                const wl = calculateMemberWorkload(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => setActiveTab("team")}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative w-6 h-6 flex-shrink-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover rounded-full ring-1 ring-slate-200"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full ring-1 ring-white ${
                              member.isOnline
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                        </div>
                        <span className="font-bold text-slate-900 truncate">
                          {member.name}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-700">
                        {wl.doneCount}/{wl.totalAssigned} done
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          wl.doneCount === wl.totalAssigned &&
                          wl.totalAssigned > 0
                            ? "bg-emerald-500"
                            : "bg-[#4648d4]"
                        }`}
                        style={{ width: `${wl.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
