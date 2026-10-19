"use client";

import React, { useState } from "react";
import { useTaskFlow } from "@/context/TaskContext";

export default function KanbanBoardView() {
  const {
    tasks,
    team,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    activeKanbanColumn,
    setActiveKanbanColumn,
    setIsCreateModalOpen,
    setEditingTask,
    setAssigningTaskId,
    handleMoveColumn,
    handleToggleTaskStatus
  } = useTaskFlow();

  const [viewMode, setViewMode] = useState("board");
  const [mobileLayout, setMobileLayout] = useState("single");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const columns = [
    {
      id: "todo",
      title: "To Do",
      accent: "#f59e0b",
      badgeBg: "bg-amber-50 text-amber-800 border-amber-200/80",
      dot: "bg-amber-500",
      icon: "pending_actions"
    },
    {
      id: "inprogress",
      title: "In Progress",
      accent: "#4648d4",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      dot: "bg-[#4648d4]",
      icon: "hourglass_top"
    },
    {
      id: "done",
      title: "Done",
      accent: "#10b981",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      dot: "bg-emerald-500",
      icon: "check_circle"
    },
    {
      id: "backlog",
      title: "Backlog",
      accent: "#64748b",
      badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-500",
      icon: "inbox"
    }
  ];

  const projectTasks = tasks.filter((t) => {
    if (selectedProjectId !== "all" && t.projectId !== selectedProjectId) return false;
    return true;
  });

  const selectedProjectObj = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (taskId) {
      handleMoveColumn(taskId, columnId);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const renderCard = (task) => {
    const assignee = team.find((m) => m.id === task.assigneeId);
    const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
    const completedSubtasks = task.subtasks
      ? task.subtasks.filter((s) => s.completed).length
      : 0;
    const subtaskPercentage =
      totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
    const isUrgent = task.priority === "urgent";

    return (
      <article
        key={task.id}
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        className="group relative flex flex-col bg-white rounded-2xl p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(19,27,46,0.04)] border border-slate-200/90 hover:border-indigo-300 hover:shadow-[0_6px_20px_rgba(70,72,212,0.1)] transition-all cursor-grab active:cursor-grabbing active:scale-[0.99] select-none"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[#4648d4] text-[10px] sm:text-[11px] font-bold border border-indigo-100">
              {task.projectName}
            </span>
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold border ${
                isUrgent
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : task.priority === "high"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
              {task.priority.toUpperCase()}
            </span>
          </div>

          <button
            onClick={() => setEditingTask(task)}
            className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="Edit Task"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
          </button>
        </div>

        <h3
          onClick={() => setEditingTask(task)}
          className="cursor-pointer text-[14px] sm:text-[15px] leading-snug text-slate-900 font-bold mb-1 hover:text-[#4648d4] transition-colors"
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {totalSubtasks > 0 && (
          <div className="mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <div className="flex items-center justify-between text-slate-600 text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px]">
                <span className="material-symbols-outlined text-[15px] text-emerald-600">
                  check_circle
                </span>
                Subtasks
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {completedSubtasks}/{totalSubtasks} ({subtaskPercentage}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${subtaskPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 text-slate-500 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAssigningTaskId(task.id)}
              className="flex items-center gap-1.5 hover:ring-2 hover:ring-indigo-300 p-0.5 rounded-full transition-all"
              title="Click to assign or reassign"
            >
              {assignee ? (
                <>
                  <div className="relative w-6 h-6 rounded-full ring-1 ring-slate-200 flex-shrink-0">
                    <img
                      alt={assignee.name}
                      className="w-full h-full object-cover rounded-full"
                      src={assignee.avatar}
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded hidden sm:inline">
                    {assignee.initials}
                  </span>
                </>
              ) : task.assigneeName && task.assigneeName !== "Unassigned" ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold ring-1 ring-violet-200 flex-shrink-0">
                    {task.assigneeName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded hidden sm:inline truncate max-w-[80px]">
                    {task.assigneeName}
                  </span>
                </>
              ) : (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  + Assign
                </span>
              )}
            </button>

            <span className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[10px] sm:text-[11px]">
              <span className="material-symbols-outlined text-[13px] text-slate-500">
                schedule
              </span>
              <span>{task.dueDate}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {task.commentsCount > 0 && (
              <span className="flex items-center gap-0.5 text-slate-500 text-[11px] font-mono">
                <span className="material-symbols-outlined text-[13px]">
                  chat_bubble_outline
                </span>
                <span>{task.commentsCount}</span>
              </span>
            )}
            {task.attachmentsCount > 0 && (
              <span className="flex items-center gap-0.5 text-slate-500 text-[11px] font-mono">
                <span className="material-symbols-outlined text-[13px]">attach_file</span>
                <span>{task.attachmentsCount}</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 flex items-center justify-end border-t border-slate-100 gap-1.5 flex-wrap">
          {task.status !== "todo" && (
            <button
              onClick={() => handleMoveColumn(task.id, "todo")}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] sm:text-[11px] font-bold transition-all"
            >
              ← To Do
            </button>
          )}
          {task.status !== "inprogress" && (
            <button
              onClick={() => handleMoveColumn(task.id, "inprogress")}
              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4648d4] text-[10px] sm:text-[11px] font-bold transition-all"
            >
              In Progress →
            </button>
          )}
          {task.status !== "done" && (
            <button
              onClick={() => handleMoveColumn(task.id, "done")}
              className="flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold transition-all"
            >
              <span>Done</span>
              <span className="material-symbols-outlined text-[13px]">check</span>
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="flex flex-col w-full pb-8 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-slate-800 transition-all active:scale-95"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-indigo-200"
                style={{ backgroundColor: selectedProjectObj.color || "#4648d4" }}
              />
              <span className="text-xs font-bold truncate max-w-[140px]">
                {selectedProjectObj.name}
              </span>
              <span className="material-symbols-outlined text-[18px] text-slate-400">
                expand_more
              </span>
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-30 p-1 flex flex-col gap-0.5 animate-in fade-in duration-150">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setIsProjectDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                      selectedProjectId === proj.id
                        ? "bg-indigo-50 text-[#4648d4]"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: proj.color }}
                      />
                      {proj.name}
                    </span>
                    {selectedProjectId === proj.id && (
                      <span className="material-symbols-outlined text-[16px] text-[#4648d4]">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            {projectTasks.length} tasks
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
          <div className="flex md:hidden items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setMobileLayout("single")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                mobileLayout === "single"
                  ? "bg-white text-[#4648d4] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Focus Lane
            </button>
            <button
              onClick={() => setMobileLayout("lanes")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                mobileLayout === "lanes"
                  ? "bg-white text-[#4648d4] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Swipe Lanes
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "board"
                  ? "bg-white text-[#4648d4] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_kanban</span>
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-white text-[#4648d4] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4648d4] hover:bg-[#3b3ecb] text-white text-xs font-bold transition-all active:scale-95 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      <div className={`md:hidden ${mobileLayout === "single" ? "block" : "hidden"} space-y-2`}>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {columns.map((col) => {
            const isColActive = activeKanbanColumn === col.id;
            const count = projectTasks.filter((t) => t.status === col.id).length;

            return (
              <button
                key={col.id}
                onClick={() => setActiveKanbanColumn(col.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all shrink-0 active:scale-95 shadow-xs ${
                  isColActive
                    ? "bg-[#4648d4] text-white ring-1 ring-[#4648d4]"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {isColActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                <span className="text-xs font-bold">{col.title}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                    isColActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Task & Details</span>
            <span className="hidden sm:inline">Status & Assignee</span>
          </div>
          {projectTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No tasks found for this project. Click "+ Add Task" to create one.
            </div>
          ) : (
            projectTasks.map((task) => {
              const assignee = team.find((m) => m.id === task.assigneeId);
              const isDone = task.status === "done";

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task.id)}
                      title={`Status: ${task.status === "inprogress" ? "In Progress" : task.status === "done" ? "Done" : "To Do"}. Click to cycle.`}
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-white transition-all active:scale-90 flex-shrink-0 ${
                        task.status === "done"
                          ? "bg-emerald-500 border-2 border-emerald-500"
                          : task.status === "inprogress"
                          ? "bg-blue-600 border-2 border-blue-600"
                          : "bg-white border-2 border-slate-300 hover:border-[#4648d4]"
                      }`}
                    >
                      {task.status === "done" && <span className="material-symbols-outlined text-[14px]">check</span>}
                      {task.status === "inprogress" && <span className="material-symbols-outlined text-[13px] text-white">hourglass_top</span>}
                    </button>

                    <div
                      onClick={() => setEditingTask(task)}
                      className="cursor-pointer min-w-0 flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            isDone ? "line-through text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                        <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                          {task.projectName}
                        </span>
                        <span>•</span>
                        <span>Due {task.dueDate}</span>
                        <span>•</span>
                        <span
                          className={`font-semibold capitalize ${
                            isDone
                              ? "text-emerald-600"
                              : task.status === "inprogress"
                              ? "text-[#4648d4]"
                              : "text-amber-600"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setAssigningTaskId(task.id)}
                      className="p-1 rounded-full hover:ring-2 hover:ring-indigo-300 transition-all"
                      title={assignee ? `Assigned to ${assignee.name}` : "Assign task"}
                    >
                      {assignee ? (
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center text-[10px]">
                          +
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div>
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {columns.map((col) => {
              const colTasks = projectTasks.filter((t) => t.status === col.id);
              const isOver = dragOverColumn === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`flex flex-col bg-slate-100/70 rounded-2xl p-3 border transition-all min-h-[460px] ${
                    isOver
                      ? "border-[#4648d4] ring-2 ring-indigo-200 bg-indigo-50/40"
                      : "border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/60 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                        {col.title}
                      </h3>
                      <span className="px-2 py-0.2 rounded-full font-mono text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                        {colTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors text-xs"
                      title={`Add task to ${col.title}`}
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[72vh] custom-scrollbar pr-0.5">
                    {colTasks.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                        <span className="material-symbols-outlined text-2xl mb-1 text-slate-300">
                          {col.icon}
                        </span>
                        <p className="text-xs font-semibold text-slate-500">Drop cards here</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">or click + to create</p>
                      </div>
                    ) : (
                      colTasks.map((task) => renderCard(task))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="block md:hidden">
            {mobileLayout === "single" ? (
              <div className="flex flex-col gap-3">
                {projectTasks.filter((t) => t.status === activeKanbanColumn).length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center flex flex-col items-center justify-center space-y-2">
                    <span className="material-symbols-outlined text-4xl text-slate-300">
                      inbox
                    </span>
                    <p className="text-sm font-bold text-slate-700">No cards in this column</p>
                    <p className="text-xs text-slate-500">
                      Click "+ Add Task" to create one in{" "}
                      {columns.find((c) => c.id === activeKanbanColumn)?.title}
                    </p>
                  </div>
                ) : (
                  projectTasks
                    .filter((t) => t.status === activeKanbanColumn)
                    .map((task) => renderCard(task))
                )}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3 -mx-3.5 px-3.5">
                {columns.map((col) => {
                  const colTasks = projectTasks.filter((t) => t.status === col.id);

                  return (
                    <div
                      key={col.id}
                      className="w-[84vw] max-w-[340px] shrink-0 snap-center flex flex-col bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 min-h-[440px]"
                    >
                      <div className="flex items-center justify-between pb-2.5 px-1 border-b border-slate-200/60 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                          <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                            {col.title}
                          </h3>
                          <span className="px-2 py-0.2 rounded-full font-mono text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                            {colTasks.length}
                          </span>
                        </div>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[15px]">add</span>
                        </button>
                      </div>

                      <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
                        {colTasks.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                            <span className="material-symbols-outlined text-2xl mb-1 text-slate-300">
                              {col.icon}
                            </span>
                            <p className="text-xs font-semibold text-slate-500">No tasks</p>
                          </div>
                        ) : (
                          colTasks.map((task) => renderCard(task))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
