import { differenceInDays } from 'date-fns';
import type { ViewMode } from '../types/timeline';
import type { Task } from '../types/task';
import { WEEK_WIDTH } from '../constants';
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
  return calculateMonthSpanWidth(task.startDate, task.endDate);
}

/**
 * Calculate the total width in pixels for a date span across months
 */
export function calculateMonthSpanWidth(startDate: Date, endDate: Date): number {
  const monthStart = getMonthStart(startDate);
  const monthEnd = getMonthStart(endDate);
  const monthsSpanned = getMonthsBetween(monthStart, monthEnd) + 1;

  let totalWidth = 0;
  for (let i = 0; i < monthsSpanned; i++) {
    const currentMonth = addMonths(monthStart, i);
    totalWidth += calculateMonthWidth(currentMonth);
  }

  return totalWidth;
}

/**
 * Calculate the pixel offset from timeline start to a given date
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

  // For month view, sum the widths of all months from start to target
  const monthStart = getMonthStart(timelineStart);
  const targetMonthStart = getMonthStart(targetDate);
  const monthsDiff = getMonthsBetween(monthStart, targetMonthStart);

  let offset = 0;
  for (let i = 0; i < monthsDiff; i++) {
    const currentMonth = addMonths(monthStart, i);
    offset += calculateMonthWidth(currentMonth);
  }

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
  let currentOffset = 0;
  let currentDate = getMonthStart(timelineStart);
  let monthIndex = 0;

  while (currentOffset < pixelOffset) {
    const monthWidth = calculateMonthWidth(currentDate);
    if (currentOffset + monthWidth > pixelOffset) {
      break;
    }
    currentOffset += monthWidth;
    monthIndex++;
    currentDate = addMonths(getMonthStart(timelineStart), monthIndex);
  }

  return currentDate;
}

/**
 * Calculate the number of days between two dates
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  return differenceInDays(endDate, startDate);
}
