import { useState, useCallback, useRef } from 'react';
import type { Task } from '../types/task';
import type { ViewMode } from '../types/timeline';
import { getWeekStart, addWeeks, calculateDuration, calculateEndDate } from '../utils/weekHelpers';
import { getMonthStart, addMonths } from '../utils/monthHelpers';
import { pixelToWeekOffset } from '../utils/taskPositioning';
import { pixelToDate, getTimeUnitStart, getDaysBetween } from '../utils/timeHelpers';
import { MIN_TASK_DURATION } from '../constants';

export type ResizeHandle = 'left' | 'right';

interface UseTaskResizeProps {
  onResizeComplete: (taskId: string, startDate: Date, durationWeeks: number) => void;
  viewMode: ViewMode;
}

/**
 * Custom hook for handling task resize operations
 */
export function useTaskResize({ onResizeComplete, viewMode }: UseTaskResizeProps) {
  const [resizingTask, setResizingTask] = useState<{
    task: Task;
    handle: ResizeHandle;
    initialX: number;
    initialStartDate: Date;
    initialDuration: number;
  } | null>(null);

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
    (clientX: number, timelineStartDate: Date) => {
      if (!resizingTask) return null;

      const deltaX = clientX - resizingTask.initialX;

      let newStartDate = resizingTask.initialStartDate;
      let newDuration = resizingTask.initialDuration;

      if (viewMode === 'week') {
        const weeksDelta = pixelToWeekOffset(deltaX);

        if (resizingTask.handle === 'left') {
          // Adjust start date, keep end date fixed
          const proposedStartDate = addWeeks(resizingTask.initialStartDate, weeksDelta);
          const endDate = calculateEndDate(
            resizingTask.initialStartDate,
            resizingTask.initialDuration
          );
          const proposedDuration = calculateDuration(proposedStartDate, endDate);

          if (proposedDuration >= MIN_TASK_DURATION) {
            newStartDate = getWeekStart(proposedStartDate);
            newDuration = proposedDuration;
          }
        } else {
          // Adjust duration, keep start date fixed
          const proposedDuration = Math.max(
            MIN_TASK_DURATION,
            resizingTask.initialDuration + weeksDelta
          );
          newDuration = proposedDuration;
        }
      } else {
        // Month view resizing
        // For simplicity, we'll snap to month boundaries
        // and calculate duration based on days -> weeks conversion
        if (resizingTask.handle === 'left') {
          // Adjust start date, keep end date fixed
          const endDate = calculateEndDate(
            resizingTask.initialStartDate,
            resizingTask.initialDuration
          );

          // Calculate target date based on pixel position
          const currentLeft = 0; // Relative to task bar
          const targetPixel = currentLeft + deltaX;
          const proposedStartDate = pixelToDate(viewMode, timelineStartDate, Math.max(0, targetPixel));
          const snappedStart = getMonthStart(proposedStartDate);

          // Calculate duration in weeks from new start to end
          const days = getDaysBetween(snappedStart, endDate);
          const proposedDuration = Math.max(MIN_TASK_DURATION, Math.ceil(days / 7));

          if (proposedDuration >= MIN_TASK_DURATION && snappedStart < endDate) {
            newStartDate = snappedStart;
            newDuration = proposedDuration;
          }
        } else {
          // Adjust end date, keep start date fixed
          // This is more complex in month view, but we'll approximate
          // by converting pixels to months and then to weeks
          const approxMonthsDelta = Math.round(deltaX / 400); // ~400px per month average

          if (approxMonthsDelta !== 0) {
            const endDate = calculateEndDate(
              resizingTask.initialStartDate,
              resizingTask.initialDuration
            );
            const newEndDate = addMonths(endDate, approxMonthsDelta);
            const days = getDaysBetween(resizingTask.initialStartDate, newEndDate);
            const proposedDuration = Math.max(MIN_TASK_DURATION, Math.ceil(days / 7));

            newDuration = proposedDuration;
          }
        }
      }

      return {
        taskId: resizingTask.task.id,
        startDate: newStartDate,
        durationWeeks: newDuration,
      };
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

      const result = handleResizeMove(
        lastClientXRef.current,
        timelineStartDate
      );

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
