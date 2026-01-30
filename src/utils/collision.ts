import type { Task } from '../types/task';

/**
 * Check if two date ranges overlap
 */
export function dateRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && start2 <= end1;
}

/**
 * Check if two tasks overlap in time
 */
export function tasksOverlap(task1: Task, task2: Task): boolean {
  return dateRangesOverlap(
    task1.startDate,
    task1.endDate,
    task2.startDate,
    task2.endDate
  );
}

/**
 * Find all tasks that overlap with a given task
 */
export function findOverlappingTasks(task: Task, allTasks: Task[]): Task[] {
  return allTasks.filter(
    (other) => other.id !== task.id && tasksOverlap(task, other)
  );
}

/**
 * Group tasks by overlapping ranges
 * Returns an array of task groups where each group contains overlapping tasks
 */
export function groupOverlappingTasks(tasks: Task[]): Task[][] {
  if (tasks.length === 0) return [];

  const sorted = [...tasks].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );
  const groups: Task[][] = [];
  let currentGroup: Task[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const task = sorted[i];
    const overlapsWithGroup = currentGroup.some((groupTask) =>
      tasksOverlap(task, groupTask)
    );

    if (overlapsWithGroup) {
      currentGroup.push(task);
    } else {
      groups.push(currentGroup);
      currentGroup = [task];
    }
  }

  groups.push(currentGroup);
  return groups;
}
