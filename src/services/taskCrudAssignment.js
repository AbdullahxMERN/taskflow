export function createTask(tasks = [], newTaskData = {}) {
  const title = (newTaskData.title || "").trim();

  if (title.length < 3) throw new Error("Task title must be at least 3 characters");

  const dueTimestamp = newTaskData.dueTimestamp || new Date().toISOString();
  const status = newTaskData.status || "todo";
  const isOverdue =
    status !== "done" &&
    dueTimestamp &&
    new Date(dueTimestamp).getTime() < Date.now();

  const newTask = {
    id: "task-" + Date.now(),
    taskNumber: "",
    title,
    description: newTaskData.description || "",
    status,
    priority: newTaskData.priority || "medium",
    projectId: newTaskData.projectId || "core",
    projectName: newTaskData.projectName || "Core App",
    assigneeId: newTaskData.assigneeId || null,
    assigneeName: newTaskData.assigneeName || "Unassigned",
    dueDate: newTaskData.dueDate || "Next Sprint",
    dueTimestamp,
    isOverdue,
    commentsCount: 0,
    attachmentsCount: 0,
    subtasks: newTaskData.subtasks || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return [newTask, ...tasks];
}

export function updateTask(tasks = [], taskId, changes = {}) {
  if (!taskId) return tasks;

  const now = Date.now();
  return tasks.map((task) => {
    if (task.id === taskId) {
      const merged = { ...task, ...changes, updatedAt: new Date().toISOString() };
      if (merged.status === "done") {
        merged.isOverdue = false;
      } else if (merged.dueTimestamp) {
        merged.isOverdue = new Date(merged.dueTimestamp).getTime() < now;
      }
      return merged;
    }
    return task;
  });
}

export function deleteTask(tasks = [], taskId) {
  if (!taskId) return tasks;
  return tasks.filter((task) => task.id !== taskId);
}

export function toggleTaskStatus(tasks = [], taskId) {
  if (!taskId) return tasks;

  const now = Date.now();
  return tasks.map((task) => {
    if (task.id === taskId) {
      let nextStatus = "inprogress";
      if (task.status === "todo") {
        nextStatus = "inprogress";
      } else if (task.status === "inprogress") {
        nextStatus = "done";
      } else {
        nextStatus = "todo";
      }

      const isDone = nextStatus === "done";
      const isOverdue =
        !isDone &&
        task.dueTimestamp &&
        new Date(task.dueTimestamp).getTime() < now;

      return {
        ...task,
        status: nextStatus,
        isOverdue,
        subtasks: (task.subtasks || []).map((st) => ({
          ...st,
          completed: isDone ? true : st.completed
        })),
        updatedAt: new Date().toISOString()
      };
    }
    return task;
  });
}

export function filterAndSearchTasks(tasks = [], filters = {}) {
  const query = (filters.searchQuery || "").trim().toLowerCase();
  const project = filters.projectId || "all";
  const status = filters.status || "all";
  const priority = filters.priority || "all";
  const assignee = filters.assigneeId || "all";

  return tasks.filter((task) => {
    if (query) {
      const title = (task.title || "").toLowerCase();
      const desc = (task.description || "").toLowerCase();
      const num = (task.taskNumber || "").toLowerCase();
      if (!title.includes(query) && !desc.includes(query) && !num.includes(query)) {
        return false;
      }
    }

    if (project !== "all" && task.projectId !== project) return false;
    if (status !== "all" && task.status !== status) return false;
    if (priority !== "all" && task.priority !== priority) return false;

    if (assignee !== "all") {
      if (assignee === "unassigned") {
        if (task.assigneeId) return false;
      } else {
        if (task.assigneeId !== assignee) return false;
      }
    }

    return true;
  });
}

