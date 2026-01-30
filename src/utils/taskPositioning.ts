import type { Task } from '../types/task';
import type { TaskPosition, ViewMode } from '../types/timeline';
import { TASK_HEIGHT, TASK_GAP, WEEK_WIDTH } from '../constants';
import { findOverlappingTasks } from './collision';
import { calculatePixelOffset, calculateTaskWidth } from './timeHelpers';

/**
 * Calculate stack positions for all tasks using a greedy algorithm
 * Ensures that overlapping tasks are stacked vertically without gaps
 */
export function calculateStackPositions(tasks: Task[]): Task[] {
  if (tasks.length === 0) return [];

  // Sort by start date, then by duration (longer first)
  const sorted = [...tasks].sort((a, b) => {
    const dateCompare = a.startDate.getTime() - b.startDate.getTime();
    if (dateCompare !== 0) return dateCompare;
    return b.durationWeeks - a.durationWeeks;
  });

  const positioned: Task[] = [];

  for (const task of sorted) {
    const overlapping = findOverlappingTasks(task, positioned);

    if (overlapping.length === 0) {
      // No overlap, place at position 0
      positioned.push({ ...task, stackPosition: 0 });
    } else {
      // Find the lowest available position
      const usedPositions = overlapping.map((t) => t.stackPosition);
      let position = 0;

      while (usedPositions.includes(position)) {
        position++;
      }

      positioned.push({ ...task, stackPosition: position });
    }
  }

  // Return in original order
  return tasks.map((task) => {
    const found = positioned.find((p) => p.id === task.id);
    return found || task;
  });
}

/**
 * Calculate the visual dimensions for a task in the timeline
 */
export function calculateTaskDimensions(
  task: Task,
  timelineStartDate: Date,
  viewMode: ViewMode = 'week'
): TaskPosition {
  const left = calculatePixelOffset(viewMode, timelineStartDate, task.startDate);
  const width = calculateTaskWidth(viewMode, task);
  const top = task.stackPosition * (TASK_HEIGHT + TASK_GAP);
  const height = TASK_HEIGHT;

  return { left, width, top, height };
}

/**
 * Calculate the total height needed for the timeline
 * Based on the maximum stack position
 */
export function calculateTimelineHeight(tasks: Task[]): number {
  if (tasks.length === 0) return TASK_HEIGHT + TASK_GAP;

  const maxStackPosition = Math.max(...tasks.map((t) => t.stackPosition));
  return (maxStackPosition + 1) * (TASK_HEIGHT + TASK_GAP);
}

/**
 * Calculate which week a pixel position corresponds to
 */
export function pixelToWeekOffset(pixelX: number): number {
  return Math.floor(pixelX / WEEK_WIDTH);
}

/**
 * Calculate pixel position for a week offset
 */
export function weekOffsetToPixel(weekOffset: number): number {
  return weekOffset * WEEK_WIDTH;
}
