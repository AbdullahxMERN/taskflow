"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { INITIAL_TASKS, INITIAL_TEAM, PROJECTS } from "@/data/initialData";
import {
  assignTask,
  unassignTask,
  calculateMemberWorkload,
  getSquadAssignmentOverview
} from "@/services/taskAssignment";
import {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  filterAndSearchTasks
} from "@/services/taskCrudAssignment";

const TaskContext = createContext(null);

const LS_KEY = "taskflow_tasks";
const LS_TEAM_KEY = "taskflow_team";
const LS_PROJECTS_KEY = "taskflow_projects";

function loadFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(tasks) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  } catch {}
}

function loadTeamFromStorage() {
  if (typeof window === "undefined") return INITIAL_TEAM;
  try {
    const raw = localStorage.getItem(LS_TEAM_KEY);
    return raw ? JSON.parse(raw) : INITIAL_TEAM;
  } catch {
    return INITIAL_TEAM;
  }
}

function saveTeamToStorage(team) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_TEAM_KEY, JSON.stringify(team));
  } catch {}
}

function loadProjectsFromStorage() {
  if (typeof window === "undefined") return PROJECTS;
  try {
    const raw = localStorage.getItem(LS_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : PROJECTS;
  } catch {
    return PROJECTS;
  }
}

function saveProjectsToStorage(projects) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_PROJECTS_KEY, JSON.stringify(projects));
  } catch {}
}

function markOverdue(tasks) {
  const now = Date.now();
  return tasks.map((t) => ({
    ...t,
    isOverdue:
      t.status !== "done" &&
      Boolean(t.dueTimestamp) &&
      new Date(t.dueTimestamp).getTime() < now
  }));
}

export function TaskProvider({ children }) {
  const [tasks, setTasksRaw] = useState(() => {
    const stored = loadFromStorage();
    return markOverdue(stored ?? []);
  });

  const [team, setTeamRaw] = useState(() => loadTeamFromStorage());
  const [projectsList, setProjectsListRaw] = useState(() => loadProjectsFromStorage());
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeKanbanColumn, setActiveKanbanColumn] = useState("inprogress");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "danger",
    onConfirm: null
  });

  const openConfirmModal = useCallback(({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    onConfirm
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
      onConfirm
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  }, []);

  const setTasks = useCallback((newTasksOrUpdater) => {
    setTasksRaw((prev) => {
      const next =
        typeof newTasksOrUpdater === "function"
          ? newTasksOrUpdater(prev)
          : newTasksOrUpdater;
      const marked = markOverdue(next);
      saveToStorage(marked);
      return marked;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) => markOverdue(prev));
    }, 60_000);
    return () => clearInterval(interval);
  }, [setTasks]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleAssignTask = useCallback((taskId, member) => {
    setTasks((prev) => assignTask(prev, taskId, member));
    showToast(`Task assigned to ${member ? member.name : "Unassigned"}`);
    setAssigningTaskId(null);
  }, [setTasks, showToast]);

  const handleUnassignTask = useCallback((taskId) => {
    setTasks((prev) => unassignTask(prev, taskId));
    showToast("Task marked as unassigned");
    setAssigningTaskId(null);
  }, [setTasks, showToast]);

  const handleCreateTask = useCallback((taskData) => {
    try {
      setTasks((prev) => createTask(prev, taskData));
      setIsCreateModalOpen(false);
      showToast("Task created successfully!");
    } catch (err) {
      showToast(err.message || "Failed to create task", "error");
    }
  }, [setTasks, showToast]);

  const handleUpdateTask = useCallback((taskId, updates) => {
    try {
      setTasks((prev) => updateTask(prev, taskId, updates));
      setEditingTask(null);
      showToast("Task updated successfully!");
    } catch (err) {
      showToast(err.message || "Failed to update task", "error");
    }
  }, [setTasks, showToast]);

  const handleDeleteTask = useCallback((taskId) => {
    try {
      setTasks((prev) => deleteTask(prev, taskId));
      if (editingTask && editingTask.id === taskId) setEditingTask(null);
      showToast("Task deleted");
    } catch (err) {
      showToast(err.message || "Failed to delete task", "error");
    }
  }, [setTasks, showToast, editingTask]);

  const handleMarkTaskDone = useCallback((taskId) => {
    setTasks((prev) => updateTask(prev, taskId, { status: "done", isOverdue: false }));
    showToast("Task marked as Done!");
  }, [setTasks, showToast]);

  const handleToggleTaskStatus = useCallback((taskId) => {
    setTasks((prev) => toggleTaskStatus(prev, taskId));
  }, [setTasks]);

  const handleMoveColumn = useCallback((taskId, newStatus) => {
    setTasks((prev) => updateTask(prev, taskId, { status: newStatus }));
    showToast(`Moved to ${newStatus.toUpperCase()}`);
  }, [setTasks, showToast]);

  const setTeam = useCallback((updater) => {
    setTeamRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveTeamToStorage(next);
      return next;
    });
  }, []);

  const setProjectsList = useCallback((updater) => {
    setProjectsListRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveProjectsToStorage(next);
      return next;
    });
  }, []);

  const handleAddProject = useCallback((projectObj) => {
    setProjectsList((prev) => {
      if (prev.some((p) => p.id === projectObj.id)) return prev;
      return [...prev, projectObj];
    });
  }, [setProjectsList]);

  const handleAddTeamMember = useCallback((memberObj) => {
    setTeam((prev) => {
      if (prev.some((m) => m.id === memberObj.id)) return prev;
      return [...prev, memberObj];
    });
  }, [setTeam]);

  const handleRemoveTeamMember = useCallback((memberId) => {
    setTeam((prev) => prev.filter((m) => m.id !== memberId));
    setTasks((prev) =>
      prev.map((t) =>
        t.assigneeId === memberId
          ? { ...t, assigneeId: null, assigneeName: "Unassigned" }
          : t
      )
    );
    showToast("Member removed from team");
  }, [setTeam, setTasks, showToast]);

  const handleClearAllTasks = useCallback(() => {
    setTasks([]);
    showToast("All tasks have been removed");
  }, [setTasks, showToast]);

  const projects = useMemo(() => {
    const map = new Map();
    projectsList.forEach((p) => map.set(p.id, p));
    tasks.forEach((t) => {
      if (t.projectId && !map.has(t.projectId)) {
        map.set(t.projectId, {
          id: t.projectId,
          name: t.projectName || t.projectId,
          count: 0,
          color: "#8b5cf6",
          isCustom: true
        });
      }
    });
    return Array.from(map.values());
  }, [projectsList, tasks]);

  const filteredTasks = useMemo(() =>
    filterAndSearchTasks(tasks, { searchQuery, projectId: selectedProjectId }),
    [tasks, searchQuery, selectedProjectId]
  );

  const squadOverview = useMemo(() =>
    getSquadAssignmentOverview(tasks, team),
    [tasks, team]
  );

  const overdueNotifications = useMemo(() =>
    tasks
      .filter((t) => t.isOverdue && t.status !== "done")
      .sort((a, b) => new Date(a.dueTimestamp) - new Date(b.dueTimestamp)),
    [tasks]
  );

  const dueTodayNotifications = useMemo(() => {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return tasks.filter((t) => {
      if (t.status === "done" || t.isOverdue || !t.dueTimestamp) return false;
      const due = new Date(t.dueTimestamp);
      return due <= endOfDay;
    }).sort((a, b) => new Date(a.dueTimestamp) - new Date(b.dueTimestamp));
  }, [tasks]);

  const metrics = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "todo");
    const inProgress = tasks.filter((t) => t.status === "inprogress");
    const done = tasks.filter((t) => t.status === "done");
    const backlog = tasks.filter((t) => t.status === "backlog");
    const unassignedTodo = todo.filter((t) => !t.assigneeId).length;

    return {
      total,
      todoCount: todo.length,
      unassignedTodoCount: unassignedTodo,
      inProgressCount: inProgress.length,
      doneCount: done.length,
      backlogCount: backlog.length,
      completionRate: total > 0 ? Math.round((done.length / total) * 100) : 0,
      overdueCount: tasks.filter((t) => t.isOverdue && t.status !== "done").length
    };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        team,
        setTeam,
        projects,
        handleAddProject,
        handleAddTeamMember,
        handleRemoveTeamMember,
        handleClearAllTasks,
        activeTab,
        setActiveTab,
        selectedProjectId,
        setSelectedProjectId,
        searchQuery,
        setSearchQuery,
        activeKanbanColumn,
        setActiveKanbanColumn,
        filteredTasks,
        squadOverview,
        metrics,
        toast,
        showToast,
        overdueNotifications,
        dueTodayNotifications,
        isCreateModalOpen,
        setIsCreateModalOpen,
        editingTask,
        setEditingTask,
        assigningTaskId,
        setAssigningTaskId,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        handleAssignTask,
        handleUnassignTask,
        handleCreateTask,
        handleUpdateTask,
        handleDeleteTask,
        handleMarkTaskDone,
        handleToggleTaskStatus,
        handleMoveColumn,
        confirmModal,
        openConfirmModal,
        closeConfirmModal,
        calculateMemberWorkload: (memberId) => calculateMemberWorkload(memberId, tasks)
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskFlow() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskFlow must be used within a TaskProvider");
  }
  return context;
}
