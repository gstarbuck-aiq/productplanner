import {
  startOfWeek,
  endOfWeek,
  differenceInWeeks,
  addWeeks as addWeeksFns,
  getWeek,
  format,
  isSameWeek,
} from 'date-fns';
import { WEEK_STARTS_ON } from '../constants';

/**
 * Get the start date of the week for a given date
 */
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
}

/**
 * Get the end date of the week for a given date
 */
export function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
}

/**
 * Get the ISO week number for a given date
 */
export function getWeekNumber(date: Date): number {
  return getWeek(date, { weekStartsOn: WEEK_STARTS_ON });
}

/**
 * Calculate the number of weeks between two dates
 * Returns a positive number if endDate is after startDate
 */
export function getWeeksBetween(startDate: Date, endDate: Date): number {
  const start = getWeekStart(startDate);
  const end = getWeekStart(endDate);
  return differenceInWeeks(end, start);
}

/**
 * Add a number of weeks to a date
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addWeeksFns(date, weeks);
}

/**
 * Format a date for week column header (e.g., "Jan 1", "Jan 8")
 */
export function formatWeekHeader(date: Date): string {
  return format(date, 'MMM d');
}

/**
 * Format a date range for display (e.g., "Jan 1 - Jan 7")
 */
export function formatWeekRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
}

/**
 * Check if a date is in the current week
 */
export function isCurrentWeek(date: Date): boolean {
  return isSameWeek(date, new Date(), { weekStartsOn: WEEK_STARTS_ON });
}

/**
 * Generate an array of week start dates
 */
export function generateWeeks(startDate: Date, count: number): Date[] {
  const weeks: Date[] = [];
  const baseDate = getWeekStart(startDate);

  for (let i = 0; i < count; i++) {
    weeks.push(addWeeks(baseDate, i));
  }

  return weeks;
}

/**
 * Calculate end date from start date and duration in weeks
 */
export function calculateEndDate(startDate: Date, durationWeeks: number): Date {
  const start = getWeekStart(startDate);
  return getWeekEnd(addWeeks(start, durationWeeks - 1));
}

/**
 * Calculate duration in weeks from start and end dates
 */
export function calculateDuration(startDate: Date, endDate: Date): number {
  return Math.max(1, getWeeksBetween(startDate, endDate) + 1);
}
