import {
  startOfMonth,
  endOfMonth,
  differenceInMonths,
  addMonths as addMonthsFns,
  format,
  getDaysInMonth as getDaysInMonthFns,
  isSameMonth,
} from 'date-fns';
import { BASE_DAY_WIDTH } from '../constants';

/**
 * Get the start date of the month for a given date
 */
export function getMonthStart(date: Date): Date {
  return startOfMonth(date);
}

/**
 * Get the end date of the month for a given date
 */
export function getMonthEnd(date: Date): Date {
  return endOfMonth(date);
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(date: Date): number {
  return getDaysInMonthFns(date);
}

/**
 * Calculate the number of months between two dates
 * Returns a positive number if endDate is after startDate
 */
export function getMonthsBetween(startDate: Date, endDate: Date): number {
  const start = getMonthStart(startDate);
  const end = getMonthStart(endDate);
  return differenceInMonths(end, start);
}

/**
 * Add a number of months to a date
 */
export function addMonths(date: Date, months: number): Date {
  return addMonthsFns(date, months);
}

/**
 * Format a date for month column header (e.g., "Jan 2024")
 */
export function formatMonthHeader(date: Date): string {
  return format(date, 'MMM yyyy');
}

/**
 * Format a date range for display (e.g., "Jan 2024 - Mar 2024")
 */
export function formatMonthRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, 'MMM yyyy')} - ${format(endDate, 'MMM yyyy')}`;
}

/**
 * Check if a date is in the current month
 */
export function isCurrentMonth(date: Date): boolean {
  return isSameMonth(date, new Date());
}

/**
 * Generate an array of month start dates
 */
export function generateMonths(startDate: Date, count: number): Date[] {
  const months: Date[] = [];
  const baseDate = getMonthStart(startDate);

  for (let i = 0; i < count; i++) {
    months.push(addMonths(baseDate, i));
  }

  return months;
}

/**
 * Calculate the width of a month column in pixels
 * Width is proportional to the number of days in the month
 */
export function calculateMonthWidth(date: Date): number {
  const daysInMonth = getDaysInMonth(date);
  return daysInMonth * BASE_DAY_WIDTH;
}

/**
 * Calculate end date from start date and duration in months
 */
export function calculateEndDateMonths(startDate: Date, durationMonths: number): Date {
  const start = getMonthStart(startDate);
  return getMonthEnd(addMonths(start, durationMonths - 1));
}

/**
 * Calculate duration in months from start and end dates
 */
export function calculateDurationMonths(startDate: Date, endDate: Date): number {
  return Math.max(1, getMonthsBetween(startDate, endDate) + 1);
}
