export function assignTask(tasks = [], taskId, member) {
  if (!tasks || !taskId) return tasks;
  return tasks.map((task) => {
    if (task.id === taskId) {
      return {
        ...task,
        assigneeId: member ? member.id : null,
        assigneeName: member ? member.name : "Unassigned",
        updatedAt: new Date().toISOString()
      };
    }
    return task;
  });
}

export function unassignTask(tasks = [], taskId) {
  return assignTask(tasks, taskId, null);
}

export function calculateMemberWorkload(memberId, tasks = []) {
  const memberTasks = tasks.filter((t) => t.assigneeId === memberId);
  const doneTasks = memberTasks.filter((t) => t.status === "done");
  const inProgressTasks = memberTasks.filter((t) => t.status === "inprogress");
  const todoTasks = memberTasks.filter((t) => t.status === "todo");
  const activeTasks = memberTasks.filter((t) => t.status !== "done");
  const urgentTasks = activeTasks.filter((t) => t.priority === "urgent");

  const totalAssigned = memberTasks.length;
  const doneCount = doneTasks.length;
  const activeCount = activeTasks.length;
  const inProgressCount = inProgressTasks.length;
  const todoCount = todoTasks.length;

  const completionPercentage = totalAssigned > 0
    ? Math.round((doneCount / totalAssigned) * 100)
    : 0;

  let statusLevel = "No Tasks";
  if (totalAssigned === 0) {
    statusLevel = "No Tasks";
  } else if (doneCount === totalAssigned) {
    statusLevel = "Done";
  } else if (inProgressCount > 0) {
    statusLevel = "In Progress";
  } else {
    statusLevel = "To Do";
  }

  return {
    totalAssigned,
    doneCount,
    completedCount: doneCount,
    activeCount,
    inProgressCount,
    todoCount,
    urgentCount: urgentTasks.length,
    completionPercentage,
    statusLevel,
    isOverloaded: activeCount > 6
  };
}

export function getSquadAssignmentOverview(tasks = [], team = []) {
  const unassigned = tasks.filter((t) => !t.assigneeId || t.assigneeName === "Unassigned");
  const memberStats = team.map((member) => ({
    member,
    workload: calculateMemberWorkload(member.id, tasks)
  }));

  const totalTasks = tasks.length;
  const totalAssigned = tasks.filter((t) => t.assigneeId && t.assigneeName !== "Unassigned").length;
  const totalDone = tasks.filter((t) => t.status === "done").length;
  const totalActive = tasks.filter((t) => t.status !== "done").length;

  return {
    unassignedCount: unassigned.length,
    totalTasks,
    totalAssigned,
    totalDone,
    totalActive,
    assignedPercentage: totalTasks > 0 ? Math.round((totalAssigned / totalTasks) * 100) : 0,
    memberStats
  };
}
