"use client";

import React, { useState, useMemo } from "react";
import { useTaskFlow } from "@/context/TaskContext";

export default function AssignmentView() {
  const {
    tasks,
    team,
    projects,
    setIsCreateModalOpen,
    setEditingTask,
    setAssigningTaskId,
    handleToggleTaskStatus,
    handleMoveColumn,
    handleDeleteTask,
    openConfirmModal,
    metrics
  } = useTaskFlow();

  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedAssignee, setSelectedAssignee] = useState("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matches =
          (t.title || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q) ||
          (t.assigneeName || "").toLowerCase().includes(q) ||
          (t.projectName || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedProject !== "all" && t.projectId !== selectedProject) return false;
      if (selectedStatus !== "all" && t.status !== selectedStatus) return false;
      if (selectedPriority !== "all" && t.priority !== selectedPriority) return false;

      if (selectedAssignee !== "all") {
        if (selectedAssignee === "unassigned") {
          if (t.assigneeId && t.assigneeName !== "Unassigned") return false;
        } else if (t.assigneeId !== selectedAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, search, selectedProject, selectedStatus, selectedPriority, selectedAssignee]);

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedProject !== "all" ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    selectedAssignee !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setSelectedProject("all");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSelectedAssignee("all");
  };

  return (
    <div className="flex flex-col w-full space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4648d4] text-[24px]">
              task_alt
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Tasks Directory
            </h1>
            <span className="text-xs bg-indigo-50 text-[#4648d4] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
              {tasks.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time task management, status transitions, deadlines, and ownership
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4648d4] hover:bg-[#3b3ecb] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Task</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Tasks</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{metrics.total}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">To Do</span>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">{metrics.todoCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">In Progress</span>
          <p className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-1">{metrics.inProgressCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Completed</span>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1">{metrics.doneCount}</p>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, or project..."
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#4648d4] focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center justify-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-[#4648d4]"
            >
              <option value="all">All Projects</option>
              {projects.filter((p) => p.id !== "all").map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-[#4648d4]"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
              <option value="backlog">Backlog</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-[#4648d4]"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Assignee</label>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-[#4648d4]"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">
            Showing {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
          </span>
          <span className="text-[11px] text-slate-400">
            Click any task to edit • Check circle to toggle status
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4648d4]">
              <span className="material-symbols-outlined text-[28px]">checklist</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800">No tasks found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {hasActiveFilters
                ? "No tasks match your current search or filters. Try clearing your filters."
                : "Your workspace is currently empty. Click the button below to add your first task."}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#4648d4] hover:bg-[#3b3ecb] text-white text-xs font-bold shadow-xs"
              >
                + Create First Task
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const isDone = task.status === "done";
              const isUrgent = task.priority === "urgent";
              const subtasks = task.subtasks || [];
              const completedSubs = subtasks.filter((s) => s.completed).length;

              return (
                <div
                  key={task.id}
                  className={`p-3.5 sm:p-4 hover:bg-slate-50/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone ? "bg-slate-50/40" : ""
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task.id)}
                      title={`Status: ${task.status === "inprogress" ? "In Progress" : task.status === "done" ? "Done" : "To Do"}. Click to cycle.`}
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-white transition-all active:scale-90 flex-shrink-0 mt-0.5 sm:mt-0 ${
                        task.status === "done"
                          ? "bg-emerald-500 border border-emerald-500"
                          : task.status === "inprogress"
                          ? "bg-blue-600 border border-blue-600"
                          : "bg-white border-2 border-slate-300 hover:border-[#4648d4]"
                      }`}
                    >
                      {task.status === "done" && <span className="material-symbols-outlined text-[14px]">check</span>}
                      {task.status === "inprogress" && <span className="material-symbols-outlined text-[13px] text-white">hourglass_top</span>}
                    </button>

                    <div
                      onClick={() => setEditingTask(task)}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            isDone ? "line-through text-slate-400" : "text-slate-900 hover:text-[#4648d4]"
                          }`}
                        >
                          {task.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isUrgent
                              ? "bg-rose-600 text-white animate-pulse"
                              : task.priority === "high"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                          {task.projectName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <span className="material-symbols-outlined text-[13px]">person</span>
                          {task.assigneeName || "Unassigned"}
                        </span>
                        <span>•</span>
                        <span className={`font-semibold flex items-center gap-1 ${
                          task.isOverdue && !isDone ? "text-rose-600 font-bold" : "text-slate-500"
                        }`}>
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          {task.isOverdue && !isDone ? `Overdue (${task.dueDate})` : `Due ${task.dueDate}`}
                        </span>
                        {subtasks.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-600">
                              {completedSubs}/{subtasks.length} subs
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleMoveColumn(task.id, "todo")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          task.status === "todo"
                            ? "bg-white text-amber-700 shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        To Do
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveColumn(task.id, "inprogress")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          task.status === "inprogress"
                            ? "bg-white text-blue-700 shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveColumn(task.id, "done")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          task.status === "done"
                            ? "bg-white text-emerald-700 shadow-2xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Done
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAssigningTaskId(task.id)}
                      className="p-1 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4648d4] text-[11px] font-bold transition-all flex items-center gap-1"
                      title="Assign or reassign task"
                    >
                      <span className="material-symbols-outlined text-[14px]">person_add</span>
                      <span className="hidden md:inline">Assign</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingTask(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Edit task details"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        openConfirmModal({
                          title: "Delete Task",
                          message: `Are you sure you want to delete "${task.title}"? This cannot be undone.`,
                          confirmText: "Delete Task",
                          variant: "danger",
                          onConfirm: () => handleDeleteTask(task.id)
                        });
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete task"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
