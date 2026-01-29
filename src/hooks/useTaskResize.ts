import { useState, useCallback, useRef } from 'react';
import { Task } from '../types/task';
import { getWeekStart, addWeeks, calculateDuration, calculateEndDate } from '../utils/weekHelpers';
import { pixelToWeekOffset } from '../utils/taskPositioning';
import { MIN_TASK_DURATION } from '../constants';

export type ResizeHandle = 'left' | 'right';

interface UseTaskResizeProps {
  onResizeComplete: (taskId: string, startDate: Date, durationWeeks: number) => void;
}

/**
 * Custom hook for handling task resize operations
 */
export function useTaskResize({ onResizeComplete }: UseTaskResizeProps) {
  const [resizingTask, setResizingTask] = useState<{
    task: Task;
    handle: ResizeHandle;
    initialX: number;
    initialStartDate: Date;
    initialDuration: number;
  } | null>(null);

  const rafRef = useRef<number>();
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
      const weeksDelta = pixelToWeekOffset(deltaX);

      let newStartDate = resizingTask.initialStartDate;
      let newDuration = resizingTask.initialDuration;

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

      return {
        taskId: resizingTask.task.id,
        startDate: newStartDate,
        durationWeeks: newDuration,
      };
    },
    [resizingTask]
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
