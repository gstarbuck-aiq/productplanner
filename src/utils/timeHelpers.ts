import { differenceInDays, getDate } from 'date-fns';
import type { ViewMode } from '../types/timeline';
import type { Task } from '../types/task';
import { WEEK_WIDTH, BASE_DAY_WIDTH } from '../constants';
import {
  getWeekStart,
  getWeeksBetween,
  generateWeeks,
  formatWeekHeader,
  addWeeks,
} from './weekHelpers';
import {
  getMonthStart,
  getMonthsBetween,
  generateMonths,
  formatMonthHeader,
  calculateMonthWidth,
  addMonths,
} from './monthHelpers';

/**
 * Get the width of a time unit (week or month) in pixels
 */
export function getTimeUnitWidth(viewMode: ViewMode, date?: Date): number {
  if (viewMode === 'week') {
    return WEEK_WIDTH;
  }
  if (!date) {
    throw new Error('Date is required for month view width calculation');
  }
  return calculateMonthWidth(date);
}

/**
 * Get the start date of a time unit (week or month)
 */
export function getTimeUnitStart(viewMode: ViewMode, date: Date): Date {
  return viewMode === 'week' ? getWeekStart(date) : getMonthStart(date);
}

/**
 * Calculate the number of time units between two dates
 */
export function getTimeUnitsBetween(
  viewMode: ViewMode,
  startDate: Date,
  endDate: Date
): number {
  return viewMode === 'week'
    ? getWeeksBetween(startDate, endDate)
    : getMonthsBetween(startDate, endDate);
}

/**
 * Generate an array of time unit start dates
 */
export function generateTimeUnits(
  viewMode: ViewMode,
  startDate: Date,
  count: number
): Date[] {
  return viewMode === 'week'
    ? generateWeeks(startDate, count)
    : generateMonths(startDate, count);
}

/**
 * Format a time unit header label
 */
export function formatTimeUnitHeader(viewMode: ViewMode, date: Date): string {
  return viewMode === 'week' ? formatWeekHeader(date) : formatMonthHeader(date);
}

/**
 * Add time units to a date
 */
export function addTimeUnits(viewMode: ViewMode, date: Date, units: number): Date {
  return viewMode === 'week' ? addWeeks(date, units) : addMonths(date, units);
}

/**
 * Calculate the pixel width for a task in the given view mode
 */
export function calculateTaskWidth(
  viewMode: ViewMode,
  task: Task,
  timelineStart: Date
): number {
  if (viewMode === 'week') {
    return task.durationWeeks * WEEK_WIDTH;
  }

  // For month view, calculate width based on actual date span
  // This gives day-level precision based on the task's start and end dates
  return calculateMonthSpanWidth(task.startDate, task.endDate);
}

/**
 * Calculate the total width in pixels for a date span across months
 * Uses exact day count for precise rendering
 */
export function calculateMonthSpanWidth(startDate: Date, endDate: Date): number {
  // Calculate the exact number of days in the span
  const days = differenceInDays(endDate, startDate);

  // Convert days to pixels using BASE_DAY_WIDTH
  // Add 1 to include both start and end dates (inclusive)
  return (days + 1) * BASE_DAY_WIDTH;
}

/**
 * Calculate the pixel offset from timeline start to a given date
 * In month view, calculates exact position based on day within month
 */
export function calculatePixelOffset(
  viewMode: ViewMode,
  timelineStart: Date,
  targetDate: Date
): number {
  if (viewMode === 'week') {
    const weeksDiff = getWeeksBetween(timelineStart, targetDate);
    return weeksDiff * WEEK_WIDTH;
  }

  // For month view, calculate offset with day-level precision
  const timelineMonthStart = getMonthStart(timelineStart);
  const targetMonthStart = getMonthStart(targetDate);
  const monthsDiff = getMonthsBetween(timelineMonthStart, targetMonthStart);

  // Sum the widths of all complete months between timeline start and target month
  let offset = 0;
  for (let i = 0; i < monthsDiff; i++) {
    const currentMonth = addMonths(timelineMonthStart, i);
    offset += calculateMonthWidth(currentMonth);
  }

  // Add the pixel offset for days within the target month
  // getDate() returns the day of the month (1-31)
  const dayOfMonth = getDate(targetDate);
  const dayOffset = (dayOfMonth - 1) * BASE_DAY_WIDTH;
  offset += dayOffset;

  return offset;
}

/**
 * Calculate the number of time units in a date range
 */
export function getTimeUnitsInRange(
  viewMode: ViewMode,
  startDate: Date,
  endDate: Date
): number {
  const start = getTimeUnitStart(viewMode, startDate);
  const end = getTimeUnitStart(viewMode, endDate);
  return getTimeUnitsBetween(viewMode, start, end);
}

/**
 * Get the total width in pixels for a date range
 */
export function calculateRangeWidth(
  viewMode: ViewMode,
  startDate: Date,
  endDate: Date
): number {
  if (viewMode === 'week') {
    const weeks = getWeeksBetween(startDate, endDate);
    return weeks * WEEK_WIDTH;
  }

  return calculateMonthSpanWidth(startDate, endDate);
}

/**
 * Convert pixel position to date
 * In month view, calculates the exact day within the month
 */
export function pixelToDate(
  viewMode: ViewMode,
  timelineStart: Date,
  pixelOffset: number
): Date {
  if (viewMode === 'week') {
    const weeks = Math.floor(pixelOffset / WEEK_WIDTH);
    return addWeeks(timelineStart, weeks);
  }

  // For month view, iterate through months until we reach the pixel offset
  const timelineMonthStart = getMonthStart(timelineStart);
  let currentOffset = 0;
  let currentDate = timelineMonthStart;
  let monthIndex = 0;

  // Find which month the pixel falls into
  while (currentOffset < pixelOffset) {
    const monthWidth = calculateMonthWidth(currentDate);
    if (currentOffset + monthWidth > pixelOffset) {
      // The pixel is within this month
      // Calculate which day of the month
      const pixelWithinMonth = pixelOffset - currentOffset;
      const dayIndex = Math.floor(pixelWithinMonth / BASE_DAY_WIDTH);

      // Create a date for this specific day
      const targetDate = new Date(currentDate);
      targetDate.setDate(dayIndex + 1); // +1 because days are 1-indexed

      return targetDate;
    }
    currentOffset += monthWidth;
    monthIndex++;
    currentDate = addMonths(timelineMonthStart, monthIndex);
  }

  return currentDate;
}

/**
 * Calculate the number of days between two dates
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  return differenceInDays(endDate, startDate);
}
