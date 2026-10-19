"use client";

import React, { useState } from "react";
import { useTaskFlow } from "@/context/TaskContext";

export default function TeamWorkloadView() {
  const {
    team,
    tasks,
    squadOverview,
    handleAddTeamMember,
    handleRemoveTeamMember,
    calculateMemberWorkload,
    setAssigningTaskId,
    setEditingTask,
    handleUnassignTask,
    openConfirmModal
  } = useTaskFlow();

  const [selectedMemberId, setSelectedMemberId] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Product Engineer");
  const [newCapacity, setNewCapacity] = useState("5");

  const selectedMember = selectedMemberId === "all" ? null : team.find((m) => m.id === selectedMemberId);
  const memberWorkload = selectedMember ? calculateMemberWorkload(selectedMemberId) : null;

  const assignedTasks = tasks.filter((t) => t.assigneeId && t.assigneeName !== "Unassigned");
  const displayedTasks = selectedMemberId === "all"
    ? assignedTasks
    : tasks.filter((t) => t.assigneeId === selectedMemberId);

  const totalInProgress = displayedTasks.filter((t) => t.status === "inprogress").length;
  const totalTodo = displayedTasks.filter((t) => t.status === "todo").length;
  const totalDone = displayedTasks.filter((t) => t.status === "done").length;

  const handleCreateMember = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const clean = newName.trim();
    const initials = clean
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
    const id = `usr-${clean.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

    const member = {
      id,
      name: clean,
      initials,
      role: newRole.trim() || "Team Contributor",
      department: "Product Squad",
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clean)}&backgroundColor=4648d4,7c3aed,db2777`,
      isOnline: true,
      capacity: parseInt(newCapacity, 10) || 5,
      email: `${clean.toLowerCase().replace(/\s+/g, ".")}@taskflow.io`
    };

    handleAddTeamMember(member);
    setSelectedMemberId(id);
    setNewName("");
    setIsAddModalOpen(false);
  };

  const onDeleteMember = (e, member) => {
    e.stopPropagation();
    openConfirmModal({
      title: "Remove Team Member",
      message: `Are you sure you want to remove ${member.name} from the squad? Any assigned tasks will be marked as unassigned.`,
      confirmText: "Remove Member",
      variant: "danger",
      onConfirm: () => {
        if (selectedMemberId === member.id) {
          setSelectedMemberId("all");
        }
        handleRemoveTeamMember(member.id);
      }
    });
  };

  return (
    <div className="flex flex-col w-full space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4648d4] text-[22px]">
              group
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Team Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time squad allocation, capacity quotas, and task ownership
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Assigned:</span>
            <span className="font-bold text-slate-900 text-xs">
              {squadOverview.totalAssigned} / {squadOverview.totalTasks} tasks
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.2 rounded-full font-bold">
              {squadOverview.assignedPercentage}% assigned
            </span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4648d4] hover:bg-[#3b3ecb] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#4648d4] text-[18px]">person_add</span>
                Add Team Member
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateMember} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#4648d4]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Role / Title</label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#4648d4]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Max Capacity (tasks)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#4648d4]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[#4648d4] hover:bg-[#3b3ecb] disabled:opacity-50 text-white text-xs font-bold shadow-xs"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {team.map((member) => {
          const wl = calculateMemberWorkload(member.id);
          const isSelected = selectedMemberId === member.id;

          return (
            <div
              key={member.id}
              onClick={() => setSelectedMemberId((prev) => (prev === member.id ? "all" : member.id))}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? "bg-white border-[#4648d4] ring-2 ring-indigo-200 shadow-md"
                  : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 flex-shrink-0">
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
                    <h3 className="text-xs font-bold text-slate-900 truncate">{member.name}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{member.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      wl.totalAssigned === 0
                        ? "bg-slate-100 text-slate-500"
                        : wl.doneCount === wl.totalAssigned
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {wl.totalAssigned === 0
                      ? "NO TASKS"
                      : `${wl.doneCount}/${wl.totalAssigned} DONE`}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => onDeleteMember(e, member)}
                    title={`Remove ${member.name}`}
                    className="w-6 h-6 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors opacity-70 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>

              <div className="mt-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Tasks Done</span>
                  <span className="font-mono font-bold text-slate-800">
                    {wl.doneCount} / {wl.totalAssigned} ({wl.completionPercentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      wl.doneCount === wl.totalAssigned && wl.totalAssigned > 0
                        ? "bg-emerald-500"
                        : "bg-[#4648d4]"
                    }`}
                    style={{ width: `${wl.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            {selectedMember ? (
              <img
                src={selectedMember.avatar}
                alt={selectedMember.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-200 flex-shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#4648d4] to-violet-500 flex items-center justify-center text-white shadow-xs flex-shrink-0">
                <span className="material-symbols-outlined text-[22px]">group</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {selectedMember ? selectedMember.name : "All Squad Assigned Tasks"}
                </h2>
                {selectedMember ? (
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    {selectedMember.department}
                  </span>
                ) : (
                  <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">
                    Entire Squad
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {selectedMember
                  ? selectedMember.email
                  : "Showing tasks assigned across all team members"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedMember && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedMemberId("all")}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Show All Members
                </button>
                <button
                  type="button"
                  onClick={(e) => onDeleteMember(e, selectedMember)}
                  className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  <span>Remove Member</span>
                </button>
              </>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold">
              {totalInProgress} In Progress
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold">
              {totalTodo} To Do
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold">
              {totalDone} Done
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {selectedMember
                ? `Tasks for ${selectedMember.name} (${displayedTasks.length})`
                : `Assigned Squad Tasks (${displayedTasks.length})`}
            </h3>
            <span className="text-[11px] text-slate-400">
              Click a task to edit details, or reassign with the button
            </span>
          </div>

          {displayedTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-slate-300">task_alt</span>
              <p>
                {selectedMember
                  ? `No tasks currently assigned to ${selectedMember.name}.`
                  : "No assigned tasks yet in the workspace."}
              </p>
              <p className="text-[11px] text-slate-400">
                Click "+ New Task" in the header or reassign an existing task.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/60 transition-all gap-2"
                >
                  <div
                    onClick={() => setEditingTask(task)}
                    className="cursor-pointer flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {task.title}
                      </span>
                      {task.priority === "urgent" && (
                        <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                        {task.projectName}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {task.assigneeName}
                      </span>
                      <span>•</span>
                      <span className={`font-semibold capitalize ${
                        task.status === "done"
                          ? "text-emerald-600"
                          : task.status === "inprogress"
                          ? "text-blue-600"
                          : "text-amber-600"
                      }`}>
                        {task.status === "inprogress" ? "In Progress" : task.status === "todo" ? "To Do" : "Done"}
                      </span>
                      <span>•</span>
                      <span>Due {task.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setAssigningTaskId(task.id)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4648d4] text-xs font-bold transition-colors"
                      title="Reassign to another member"
                    >
                      Reassign
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnassignTask(task.id)}
                      className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Unassign task"
                    >
                      <span className="material-symbols-outlined text-[16px]">person_off</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
