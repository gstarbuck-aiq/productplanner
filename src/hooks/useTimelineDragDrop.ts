import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState, useCallback } from 'react';
import type { Task } from '../types/task';
import type { ViewMode } from '../types/timeline';
import { getWeekStart, addWeeks } from '../utils/weekHelpers';
import { getMonthStart } from '../utils/monthHelpers';
import { pixelToWeekOffset } from '../utils/taskPositioning';
import { pixelToDate } from '../utils/timeHelpers';

interface UseTimelineDragDropProps {
  onTaskMove: (taskId: string, newStartDate: Date) => void;
  timelineStartDate: Date;
  viewMode: ViewMode;
}

/**
 * Custom hook for handling drag-and-drop operations in the timeline
 */
export function useTimelineDragDrop({
  onTaskMove,
  timelineStartDate,
  viewMode,
}: UseTimelineDragDropProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task;
    if (task) {
      setActiveTask(task);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const task = active.data.current?.task as Task;

      if (task && delta.x !== 0) {
        if (viewMode === 'week') {
          const weeksDelta = Math.round(pixelToWeekOffset(delta.x));
          if (weeksDelta !== 0) {
            const newStartDate = getWeekStart(addWeeks(task.startDate, weeksDelta));
            onTaskMove(task.id, newStartDate);
          }
        } else {
          // Month view - snap start to month boundary
          const currentTaskLeft = (event.active.rect.current.translated?.left || 0);
          const targetPixel = currentTaskLeft + delta.x;
          const newStartDate = getMonthStart(pixelToDate(viewMode, timelineStartDate, targetPixel));

          // Only move if the month actually changed
          if (newStartDate.getTime() !== getMonthStart(task.startDate).getTime()) {
            onTaskMove(task.id, newStartDate);
          }
        }
      }

      setActiveTask(null);
    },
    [onTaskMove, viewMode, timelineStartDate]
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
  }, []);

  return {
    activeTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    isDragging: activeTask !== null,
  };
}
