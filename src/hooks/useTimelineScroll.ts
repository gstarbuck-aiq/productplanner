import { useState, useCallback, useRef, useEffect } from 'react';
import { getWeekStart, addWeeks, generateWeeks } from '../utils/weekHelpers';
import { VISIBLE_WEEKS } from '../constants';

/**
 * Custom hook for managing timeline viewport and scrolling
 */
export function useTimelineScroll() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [timelineStart, setTimelineStart] = useState<Date>(() => {
    // Start 2 weeks before current week
    return getWeekStart(addWeeks(new Date(), -2));
  });

  // Generate visible weeks
  const visibleWeeks = generateWeeks(timelineStart, VISIBLE_WEEKS);

  // Scroll to a specific week
  const scrollToWeek = useCallback((weekStart: Date) => {
    setTimelineStart(getWeekStart(weekStart));
  }, []);

  // Scroll to current week
  const scrollToToday = useCallback(() => {
    const today = new Date();
    const weekStart = getWeekStart(addWeeks(today, -2));
    setTimelineStart(weekStart);
  }, []);

  // Scroll by a number of weeks
  const scrollByWeeks = useCallback(
    (weeks: number) => {
      setTimelineStart((prev) => addWeeks(prev, weeks));
    },
    []
  );

  // Scroll to next week(s)
  const scrollNext = useCallback(() => {
    scrollByWeeks(2);
  }, [scrollByWeeks]);

  // Scroll to previous week(s)
  const scrollPrevious = useCallback(() => {
    scrollByWeeks(-2);
  }, [scrollByWeeks]);

  // Auto-scroll to current week on mount
  useEffect(() => {
    scrollToToday();
  }, [scrollToToday]);

  return {
    scrollContainerRef,
    timelineStart,
    visibleWeeks,
    scrollToWeek,
    scrollToToday,
    scrollNext,
    scrollPrevious,
    scrollByWeeks,
  };
}
