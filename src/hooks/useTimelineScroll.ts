import { useCallback, useRef } from 'react';
import { addDays, addWeeks, addMonths, differenceInDays } from 'date-fns';
import { useTimelineSettings } from '../context/TimelineSettingsContext';
import { getTimeUnitStart } from '../utils/timeHelpers';

/**
 * Custom hook for managing timeline viewport and scrolling
 */
export function useTimelineScroll() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const {
    viewMode,
    dateRangeStart,
    dateRangeEnd,
    visibleTimeUnits,
    setDateRange,
  } = useTimelineSettings();

  // Scroll to a specific date (normalizes to time unit start)
  const scrollToDate = useCallback((date: Date) => {
    const normalizedStart = getTimeUnitStart(viewMode, date);
    const rangeLength = differenceInDays(dateRangeEnd, dateRangeStart);
    const normalizedEnd = addDays(normalizedStart, rangeLength);
    setDateRange(normalizedStart, normalizedEnd);
  }, [viewMode, dateRangeStart, dateRangeEnd, setDateRange]);

  // Scroll to current date (centered)
  const scrollToToday = useCallback(() => {
    const today = new Date();
    const rangeLength = differenceInDays(dateRangeEnd, dateRangeStart);
    const halfRange = Math.floor(rangeLength / 2);

    const newStart = addDays(today, -halfRange);
    const newEnd = addDays(today, halfRange);

    setDateRange(newStart, newEnd);
  }, [dateRangeStart, dateRangeEnd, setDateRange]);

  // Scroll to next period (shift by one week or month)
  const scrollNext = useCallback(() => {
    const shiftFn = viewMode === 'week' ? addWeeks : addMonths;
    const shiftAmount = 1;

    const newStart = shiftFn(dateRangeStart, shiftAmount);
    const newEnd = shiftFn(dateRangeEnd, shiftAmount);

    setDateRange(newStart, newEnd);
  }, [viewMode, dateRangeStart, dateRangeEnd, setDateRange]);

  // Scroll to previous period (shift by one week or month)
  const scrollPrevious = useCallback(() => {
    const shiftFn = viewMode === 'week' ? addWeeks : addMonths;
    const shiftAmount = -1;

    const newStart = shiftFn(dateRangeStart, shiftAmount);
    const newEnd = shiftFn(dateRangeEnd, shiftAmount);

    setDateRange(newStart, newEnd);
  }, [viewMode, dateRangeStart, dateRangeEnd, setDateRange]);

  return {
    scrollContainerRef,
    timelineStart: dateRangeStart,
    visibleWeeks: visibleTimeUnits, // Keep name for backwards compat
    visibleTimeUnits,
    viewMode,
    scrollToDate,
    scrollToToday,
    scrollNext,
    scrollPrevious,
  };
}
