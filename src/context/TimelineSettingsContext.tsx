import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { addWeeks } from 'date-fns';
import type { ViewMode, DateRange } from '../types/timeline';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getWeekStart } from '../utils/weekHelpers';
import { getTimeUnitStart, generateTimeUnits } from '../utils/timeHelpers';
import { DEFAULT_DATE_RANGE_WEEKS } from '../constants';

interface TimelineSettingsContextValue {
  viewMode: ViewMode;
  dateRangeStart: Date;
  dateRangeEnd: Date;
  visibleTimeUnits: Date[];
  setViewMode: (mode: ViewMode) => void;
  setDateRange: (start: Date, end: Date) => void;
}

const TimelineSettingsContext = createContext<TimelineSettingsContextValue | undefined>(
  undefined
);

const STORAGE_KEY = 'taskplanner_timeline_settings';

interface StoredSettings {
  viewMode: ViewMode;
  dateRangeStart: string;
  dateRangeEnd: string;
}

function getDefaultDateRange(): DateRange {
  const today = new Date();
  const start = getWeekStart(addWeeks(today, -2));
  const end = getWeekStart(addWeeks(start, DEFAULT_DATE_RANGE_WEEKS));
  return { start, end };
}

export function TimelineSettingsProvider({ children }: { children: ReactNode }) {
  const [storedSettings, setStoredSettings] = useLocalStorage<StoredSettings | null>(
    STORAGE_KEY,
    null
  );

  // Initialize from localStorage or defaults
  const defaultRange = getDefaultDateRange();
  const [viewMode, setViewModeState] = useState<ViewMode>(
    storedSettings?.viewMode || 'week'
  );
  const [dateRangeStart, setDateRangeStart] = useState<Date>(
    storedSettings?.dateRangeStart
      ? new Date(storedSettings.dateRangeStart)
      : defaultRange.start
  );
  const [dateRangeEnd, setDateRangeEnd] = useState<Date>(
    storedSettings?.dateRangeEnd
      ? new Date(storedSettings.dateRangeEnd)
      : defaultRange.end
  );

  // Calculate visible time units based on current settings
  const visibleTimeUnits = useMemo(() => {
    const start = getTimeUnitStart(viewMode, dateRangeStart);
    const end = getTimeUnitStart(viewMode, dateRangeEnd);

    // Calculate how many units we need
    let count = 0;
    let current = start;
    const increment = viewMode === 'week' ? 7 : 30; // Approximate days

    while (current <= end) {
      count++;
      current = new Date(current.getTime() + increment * 24 * 60 * 60 * 1000);
    }

    return generateTimeUnits(viewMode, start, Math.max(count, 1));
  }, [viewMode, dateRangeStart, dateRangeEnd]);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    setStoredSettings((prev) => ({
      viewMode: mode,
      dateRangeStart: prev?.dateRangeStart || dateRangeStart.toISOString(),
      dateRangeEnd: prev?.dateRangeEnd || dateRangeEnd.toISOString(),
    }));
  }, [dateRangeStart, dateRangeEnd, setStoredSettings]);

  const setDateRange = useCallback((start: Date, end: Date) => {
    const normalizedStart = getTimeUnitStart(viewMode, start);
    const normalizedEnd = getTimeUnitStart(viewMode, end);

    setDateRangeStart(normalizedStart);
    setDateRangeEnd(normalizedEnd);
    setStoredSettings({
      viewMode,
      dateRangeStart: normalizedStart.toISOString(),
      dateRangeEnd: normalizedEnd.toISOString(),
    });
  }, [viewMode, setStoredSettings]);

  const value: TimelineSettingsContextValue = {
    viewMode,
    dateRangeStart,
    dateRangeEnd,
    visibleTimeUnits,
    setViewMode,
    setDateRange,
  };

  return (
    <TimelineSettingsContext.Provider value={value}>
      {children}
    </TimelineSettingsContext.Provider>
  );
}

export function useTimelineSettings() {
  const context = useContext(TimelineSettingsContext);
  if (context === undefined) {
    throw new Error('useTimelineSettings must be used within a TimelineSettingsProvider');
  }
  return context;
}
