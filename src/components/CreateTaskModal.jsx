"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTaskFlow } from "@/context/TaskContext";

const STATUS_OPTIONS = [
  { id: "todo",       label: "To Do",       icon: "radio_button_unchecked", color: "text-amber-600",   bg: "bg-amber-50 border-amber-300" },
  { id: "inprogress", label: "In Progress", icon: "hourglass_top",          color: "text-blue-600",    bg: "bg-blue-50 border-blue-300" },
  { id: "done",       label: "Done",        icon: "check_circle",           color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-300" },
  { id: "backlog",    label: "Later",       icon: "schedule",               color: "text-slate-500",   bg: "bg-slate-100 border-slate-300" }
];

const PRIORITY_OPTIONS = [
  { id: "low",    label: "Low",    activeBg: "bg-slate-100 border-slate-400 text-slate-800" },
  { id: "medium", label: "Medium", activeBg: "bg-blue-50 border-blue-400 text-blue-800" },
  { id: "high",   label: "High",   activeBg: "bg-amber-50 border-amber-400 text-amber-800" },
  { id: "urgent", label: "Urgent", activeBg: "bg-rose-600 text-white border-rose-600" }
];

function getTomorrowDatetime() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(17, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDueDateDisplay(datetimeStr) {
  if (!datetimeStr) return "Not set";
  try {
    const d = new Date(datetimeStr);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return datetimeStr;
  }
}

export default function CreateTaskModal() {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingTask,
    setEditingTask,
    team,
    projects,
    handleAddProject,
    handleAddTeamMember,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    openConfirmModal
  } = useTaskFlow();

  const isOpen = isCreateModalOpen || Boolean(editingTask);
  const isEditing = Boolean(editingTask);

  const [title, setTitle]                       = useState("");
  const [description, setDescription]           = useState("");
  const [projectId, setProjectId]               = useState("core");
  const [priority, setPriority]                 = useState("medium");
  const [status, setStatus]                     = useState("todo");
  const [dueDate, setDueDate]                   = useState(getTomorrowDatetime);
  const dateInputRef                            = useRef(null);

  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [customAssigneeName, setCustomAssigneeName] = useState("");
  const [showCustomInput, setShowCustomInput]   = useState(false);

  const [customProjectName, setCustomProjectName] = useState("");

  const [subtasks, setSubtasks]                 = useState([]);
  const [newSubtaskInput, setNewSubtaskInput]   = useState("");
  const [isAddingSubtask, setIsAddingSubtask]   = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setProjectId(editingTask.projectId || "core");
      if (editingTask.projectId === "custom") {
        setCustomProjectName(editingTask.projectName || "");
      } else {
        setCustomProjectName("");
      }
      setPriority(editingTask.priority || "medium");
      setStatus(editingTask.status || "todo");

      if (editingTask.dueTimestamp) {
        const d = new Date(editingTask.dueTimestamp);
        if (!isNaN(d)) {
          const pad = (n) => String(n).padStart(2, "0");
          setDueDate(
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
          );
        } else {
          setDueDate(getTomorrowDatetime());
        }
      } else {
        setDueDate(getTomorrowDatetime());
      }

      const matched = team.find((m) => m.id === editingTask.assigneeId);
      if (matched) {
        setSelectedAssignee(matched);
        setCustomAssigneeName("");
        setShowCustomInput(false);
      } else if (editingTask.assigneeName && editingTask.assigneeName !== "Unassigned") {
        setSelectedAssignee(null);
        setCustomAssigneeName(editingTask.assigneeName);
        setShowCustomInput(true);
      } else {
        setSelectedAssignee(null);
        setCustomAssigneeName("");
        setShowCustomInput(false);
      }

      setSubtasks(editingTask.subtasks || []);
    } else {
      setTitle("");
      setDescription("");
      setProjectId("core");
      setCustomProjectName("");
      setPriority("medium");
      setStatus("todo");
      setDueDate(getTomorrowDatetime());
      setSelectedAssignee(null);
      setCustomAssigneeName("");
      setShowCustomInput(false);
      setSubtasks([]);
    }
    setNewSubtaskInput("");
    setIsAddingSubtask(false);
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
  };

  const handleToggleSubtask = (index) => {
    setSubtasks((prev) =>
      prev.map((st, i) => (i === index ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: `st-${Date.now()}`, text: newSubtaskInput.trim(), completed: false }
    ]);
    setNewSubtaskInput("");
    setIsAddingSubtask(false);
  };

  const handleSelectTeamMember = (member) => {
    setSelectedAssignee(member);
    setCustomAssigneeName("");
    setShowCustomInput(false);
  };

  const handleUnassign = () => {
    setSelectedAssignee(null);
    setCustomAssigneeName("");
    setShowCustomInput(false);
  };

  const handleToggleCustomInput = () => {
    setShowCustomInput((v) => !v);
    setSelectedAssignee(null);
    setCustomAssigneeName("");
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    let resolvedProjectId = projectId;
    let resolvedProjectName;
    if (projectId === "custom") {
      resolvedProjectName = customProjectName.trim() || "Custom Project";
      resolvedProjectId = "proj-" + resolvedProjectName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      handleAddProject({
        id: resolvedProjectId,
        name: resolvedProjectName,
        color: "#ec4899",
        isCustom: true
      });
    } else {
      const selectedProjObj = projects.find((p) => p.id === projectId);
      resolvedProjectName = selectedProjObj ? selectedProjObj.name : "Core App";
    }

    let assigneeId   = null;
    let assigneeName = "Unassigned";
    if (showCustomInput && customAssigneeName.trim()) {
      const cleanName = customAssigneeName.trim();
      const initials = cleanName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";
      assigneeId = `usr-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      assigneeName = cleanName;
      handleAddTeamMember({
        id: assigneeId,
        name: cleanName,
        initials,
        role: "Team Contributor",
        department: "General Squad",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}&backgroundColor=4648d4,7c3aed,db2777`,
        isOnline: true,
        capacity: 5,
        email: `${cleanName.toLowerCase().replace(/\s+/g, ".")}@taskflow.io`
      });
    } else if (selectedAssignee) {
      assigneeId   = selectedAssignee.id;
      assigneeName = selectedAssignee.name;
    }

    const dueDateISO  = dueDate ? new Date(dueDate).toISOString() : new Date().toISOString();
    const dueDateText = formatDueDateDisplay(dueDate);

    const taskPayload = {
      title,
      description,
      projectId: resolvedProjectId,
      projectName: resolvedProjectName,
      priority,
      assigneeId,
      assigneeName,
      dueDate:      dueDateText,
      dueTimestamp: dueDateISO,
      status,
      subtasks
    };

    if (isEditing) {
      handleUpdateTask(editingTask.id, taskPayload);
    } else {
      handleCreateTask(taskPayload);
    }
  };

  const isTitleValid = title.trim().length >= 3;
  const displayAssignee = showCustomInput && customAssigneeName.trim()
    ? customAssigneeName.trim()
    : selectedAssignee
      ? selectedAssignee.name
      : "Unassigned";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center md:p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto h-[92vh] md:h-auto md:max-h-[90vh] bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.35)] md:shadow-2xl border-t md:border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-200">

        <div className="w-full flex flex-col items-center pt-2.5 pb-3 px-4 sm:px-6 border-b border-slate-100 flex-shrink-0 bg-slate-50/70 select-none">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 mb-2 md:hidden" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] sm:text-[18px] font-bold text-slate-900 tracking-tight">
                {isEditing ? "Edit Task" : "Create Task"}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                  isEditing
                    ? "bg-amber-50 text-amber-800 ring-1 ring-amber-300"
                    : "bg-indigo-50 text-[#4648d4] ring-1 ring-indigo-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isEditing ? "bg-amber-500" : "bg-[#4648d4]"}`} />
                {isEditing ? "Editing" : "New Task"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    openConfirmModal({
                      title: "Delete Task",
                      message: `Are you sure you want to delete "${title || editingTask.title}"? This cannot be undone.`,
                      confirmText: "Delete Task",
                      variant: "danger",
                      onConfirm: () => handleDeleteTask(editingTask.id)
                    });
                  }}
                  className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 overscroll-contain"
        >

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-medium flex items-center gap-1">
                {isTitleValid ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Ready
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    Min 3 chars
                  </span>
                )}
              </span>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Redesign the onboarding flow"
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium border border-slate-200 focus:border-[#4648d4] focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-800">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context, acceptance criteria, or notes..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-[#4648d4] focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-800">Status</label>
            <div className="grid grid-cols-4 gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl border-2 text-[11px] font-bold transition-all active:scale-95 ${
                    status === s.id
                      ? `${s.bg} ${s.color} shadow-xs`
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${status === s.id ? s.color : "text-slate-400"}`}>
                    {s.icon}
                  </span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Priority</label>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                {priority}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((prio) => (
                <button
                  type="button"
                  key={prio.id}
                  onClick={() => setPriority(prio.id)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1 active:scale-95 ${
                    priority === prio.id
                      ? `${prio.activeBg} ring-2 ring-indigo-200 shadow-xs`
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {prio.id === "urgent" && (
                    <span className={`w-1.5 h-1.5 rounded-full ${priority === prio.id ? "bg-white animate-pulse" : "bg-rose-500"}`} />
                  )}
                  {prio.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Assign To</label>
              <span className="text-[11px] text-slate-500 font-semibold">{displayAssignee}</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {team.map((member) => {
                const isSelected = selectedAssignee && selectedAssignee.id === member.id && !showCustomInput;
                return (
                  <button
                    type="button"
                    key={member.id}
                    onClick={() => handleSelectTeamMember(member)}
                    className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all flex-shrink-0 active:scale-95 ${
                      isSelected
                        ? "border-2 border-[#4648d4] bg-indigo-50 shadow-xs"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="relative w-7 h-7 flex-shrink-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-1 ring-white ${
                          member.isOnline ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? "text-[#4648d4]" : "text-slate-700"}`}>
                      {member.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={handleUnassign}
                className={`flex items-center gap-1.5 p-1.5 px-3 rounded-full border transition-all flex-shrink-0 active:scale-95 text-xs font-semibold ${
                  !selectedAssignee && !showCustomInput
                    ? "border-2 border-slate-700 bg-slate-100 text-slate-900"
                    : "border-dashed border-slate-300 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">person_off</span>
                <span>None</span>
              </button>

              <button
                type="button"
                onClick={handleToggleCustomInput}
                className={`flex items-center gap-1.5 p-1.5 px-3 rounded-full border transition-all flex-shrink-0 active:scale-95 text-xs font-semibold ${
                  showCustomInput
                    ? "border-2 border-violet-500 bg-violet-50 text-violet-700"
                    : "border-dashed border-slate-300 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">edit</span>
                <span>Custom</span>
              </button>
            </div>

            {showCustomInput && (
              <input
                type="text"
                autoFocus
                value={customAssigneeName}
                onChange={(e) => setCustomAssigneeName(e.target.value)}
                placeholder="Type a name, e.g. John Doe"
                className="w-full h-10 px-3.5 rounded-xl bg-violet-50 text-slate-900 text-sm font-medium border border-violet-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 transition-all outline-none"
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-800">Project</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                ...projects.filter((p) => p.id !== "all"),
                { id: "custom", name: "Custom...", color: "#ec4899" }
              ].map((proj) => (
                <button
                  type="button"
                  key={proj.id}
                  onClick={() => {
                    setProjectId(proj.id);
                    if (proj.id !== "custom") setCustomProjectName("");
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                    projectId === proj.id
                      ? "border-2 border-[#4648d4] bg-indigo-50/80 text-slate-900 shadow-xs"
                      : "border border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: proj.color || "#4648d4" }}
                  />
                  <span className="truncate">{proj.name}</span>
                </button>
              ))}
            </div>
            {projectId === "custom" && (
              <input
                type="text"
                autoFocus
                value={customProjectName}
                onChange={(e) => setCustomProjectName(e.target.value)}
                placeholder="Enter project name, e.g. DevOps"
                className="w-full h-10 px-3.5 rounded-xl bg-rose-50 text-slate-900 text-sm font-medium border border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 transition-all outline-none"
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                onClick={() => dateInputRef.current?.showPicker?.()}
                className="text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer select-none"
              >
                <span className="material-symbols-outlined text-[15px] text-[#4648d4]">event</span>
                Deadline
              </label>
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker?.()}
                className="text-[11px] font-bold text-[#4648d4] hover:underline cursor-pointer"
              >
                {formatDueDateDisplay(dueDate)}
              </button>
            </div>
            <div
              onClick={() => dateInputRef.current?.showPicker?.()}
              className="relative cursor-pointer"
            >
              <input
                ref={dateInputRef}
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onClick={(e) => {
                  try {
                    e.target.showPicker?.();
                  } catch {}
                }}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium border border-slate-200 focus:border-[#4648d4] focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-bold text-slate-800">Subtasks</label>
                {subtasks.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold font-mono">
                    {subtasks.filter((s) => s.completed).length}/{subtasks.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsAddingSubtask(true)}
                className="text-xs font-bold text-[#4648d4] hover:text-indigo-800 flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[15px]">add</span>
                Add subtask
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {subtasks.length === 0 && !isAddingSubtask && (
                <p className="text-[11px] text-slate-400 italic px-1">No subtasks yet. Click "Add subtask" to break this task down.</p>
              )}

              {subtasks.map((st, index) => (
                <div
                  key={st.id || index}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(index)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-white transition-all active:scale-90 ${
                      st.completed
                        ? "bg-emerald-500 border border-emerald-500"
                        : "bg-white border-2 border-slate-300 hover:border-[#4648d4]"
                    }`}
                  >
                    {st.completed && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </button>
                  <span className={`flex-1 text-xs font-medium leading-tight ${st.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {st.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(index)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              ))}

              {isAddingSubtask && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-indigo-300 ring-2 ring-indigo-100">
                  <input
                    type="text"
                    autoFocus
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    placeholder="Enter subtask..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddSubtask(); }
                      if (e.key === "Escape") { setIsAddingSubtask(false); setNewSubtaskInput(""); }
                    }}
                    className="flex-1 text-xs text-slate-900 outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="text-xs font-bold text-white bg-[#4648d4] px-2.5 py-1 rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddingSubtask(false); setNewSubtaskInput(""); }}
                    className="text-xs text-slate-500 hover:text-slate-800 p-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="w-full px-4 sm:px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between gap-3 flex-shrink-0 shadow-sm pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <button
            type="button"
            onClick={handleClose}
            className="h-11 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isTitleValid}
            onClick={handleSubmit}
            className="h-11 px-6 rounded-xl bg-[#4648d4] hover:bg-[#3b3ecb] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex-1 max-w-[240px]"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isEditing ? "save" : "add_task"}
            </span>
            <span>{isEditing ? "Save Changes" : "Create Task"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
