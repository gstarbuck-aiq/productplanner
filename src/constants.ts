/**
 * Fixed height for all task bars in pixels
 */
export const TASK_HEIGHT = 40;

/**
 * Width of each week column in pixels
 */
export const WEEK_WIDTH = 100;

/**
 * Vertical spacing between stacked tasks in pixels
 */
export const TASK_GAP = 4;

/**
 * Number of weeks to display in the viewport at once
 */
export const VISIBLE_WEEKS = 12;

/**
 * Week starts on Monday (0 = Sunday, 1 = Monday)
 */
export const WEEK_STARTS_ON = 1;

/**
 * Preset color palette for tasks
 * Ensures good contrast and visual distinction
 */
export const COLOR_PALETTE = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

/**
 * LocalStorage key for persisting tasks
 */
export const STORAGE_KEY = 'taskplanner_tasks';

/**
 * Minimum task duration in weeks
 */
export const MIN_TASK_DURATION = 1;
