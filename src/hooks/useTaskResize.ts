import { useState, useCallback, useRef } from 'react';
import type { Task } from '../types/task';
import type { ViewMode } from '../types/timeline';
import { getWeekStart, addWeeks, calculateDuration, calculateEndDate } from '../utils/weekHelpers';
import { getMonthStart } from '../utils/monthHelpers';
import { pixelToWeekOffset } from '../utils/taskPositioning';
import { pixelToDate, getDaysBetween, calculatePixelOffset } from '../utils/timeHelpers';
import { MIN_TASK_DURATION } from '../constants';

export type ResizeHandle = 'left' | 'right';

interface ResizingTaskState {
  task: Task;
  handle: ResizeHandle;
  initialX: number;
  initialStartDate: Date;
  initialDuration: number;
}

interface ResizeResult {
  taskId: string;
  startDate: Date;
  durationWeeks: number;
}

interface UseTaskResizeProps {
  onResizeComplete: (taskId: string, startDate: Date, durationWeeks: number) => void;
  viewMode: ViewMode;
}

function computeWeekLeftResize(
  resizingTask: ResizingTaskState,
  deltaX: number
): ResizeResult | null {
  const weeksDelta = pixelToWeekOffset(deltaX);
  const endDate = calculateEndDate(resizingTask.initialStartDate, resizingTask.initialDuration);
  const proposedStartDate = addWeeks(resizingTask.initialStartDate, weeksDelta);
  const proposedDuration = calculateDuration(proposedStartDate, endDate);
  if (proposedDuration < MIN_TASK_DURATION) return null;
  return {
    taskId: resizingTask.task.id,
    startDate: getWeekStart(proposedStartDate),
    durationWeeks: proposedDuration,
  };
}

function computeWeekRightResize(
  resizingTask: ResizingTaskState,
  deltaX: number
): ResizeResult {
  const weeksDelta = pixelToWeekOffset(deltaX);
  return {
    taskId: resizingTask.task.id,
    startDate: resizingTask.initialStartDate,
    durationWeeks: Math.max(MIN_TASK_DURATION, resizingTask.initialDuration + weeksDelta),
  };
}

function computeMonthLeftResize(
  resizingTask: ResizingTaskState,
  deltaX: number,
  timelineStartDate: Date
): ResizeResult | null {
  const endDate = calculateEndDate(resizingTask.initialStartDate, resizingTask.initialDuration);
  const initialStartPixel = calculatePixelOffset('month', timelineStartDate, resizingTask.initialStartDate);
  const proposedStartDate = getMonthStart(
    pixelToDate('month', timelineStartDate, Math.max(0, initialStartPixel + deltaX))
  );
  if (proposedStartDate >= endDate) return null;
  const days = getDaysBetween(proposedStartDate, endDate);
  return {
    taskId: resizingTask.task.id,
    startDate: proposedStartDate,
    durationWeeks: Math.max(MIN_TASK_DURATION, Math.ceil(days / 7)),
  };
}

function computeMonthRightResize(
  resizingTask: ResizingTaskState,
  deltaX: number,
  timelineStartDate: Date
): ResizeResult {
  const endDate = calculateEndDate(resizingTask.initialStartDate, resizingTask.initialDuration);
  const initialEndPixel = calculatePixelOffset('month', timelineStartDate, endDate);
  const newEndDate = getMonthStart(
    pixelToDate('month', timelineStartDate, Math.max(0, initialEndPixel + deltaX))
  );
  const days = getDaysBetween(resizingTask.initialStartDate, newEndDate);
  return {
    taskId: resizingTask.task.id,
    startDate: resizingTask.initialStartDate,
    durationWeeks: Math.max(MIN_TASK_DURATION, Math.ceil(days / 7)),
  };
}

/**
 * Custom hook for handling task resize operations
 */
export function useTaskResize({ onResizeComplete, viewMode }: UseTaskResizeProps) {
  const [resizingTask, setResizingTask] = useState<ResizingTaskState | null>(null);

  const rafRef = useRef<number | undefined>(undefined);
  const lastClientXRef = useRef<number>(0);

  const startResize = useCallback(
    (task: Task, handle: ResizeHandle, clientX: number) => {
      setResizingTask({
        task,
        handle,
        initialX: clientX,
        initialStartDate: task.startDate,
        initialDuration: task.durationWeeks,
      });
    },
    []
  );

  const handleResizeMove = useCallback(
    (clientX: number, timelineStartDate: Date): ResizeResult | null => {
      if (!resizingTask) return null;

      const deltaX = clientX - resizingTask.initialX;

      if (viewMode === 'week') {
        return resizingTask.handle === 'left'
          ? computeWeekLeftResize(resizingTask, deltaX)
          : computeWeekRightResize(resizingTask, deltaX);
      } else {
        return resizingTask.handle === 'left'
          ? computeMonthLeftResize(resizingTask, deltaX, timelineStartDate)
          : computeMonthRightResize(resizingTask, deltaX, timelineStartDate);
      }
    },
    [resizingTask, viewMode]
  );

  const handleResize = useCallback(
    (e: MouseEvent, timelineStartDate: Date) => {
      if (!resizingTask) return;

      lastClientXRef.current = e.clientX;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        handleResizeMove(e.clientX, timelineStartDate);
      });
    },
    [resizingTask, handleResizeMove]
  );

  const endResize = useCallback(
    (timelineStartDate: Date) => {
      if (!resizingTask) return;

      const result = handleResizeMove(lastClientXRef.current, timelineStartDate);

      if (result) {
        onResizeComplete(result.taskId, result.startDate, result.durationWeeks);
      }

      setResizingTask(null);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    },
    [resizingTask, handleResizeMove, onResizeComplete]
  );

  const cancelResize = useCallback(() => {
    setResizingTask(null);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  return {
    resizingTask,
    startResize,
    handleResize,
    endResize,
    cancelResize,
    isResizing: resizingTask !== null,
  };
}
