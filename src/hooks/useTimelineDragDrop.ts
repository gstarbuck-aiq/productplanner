import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState, useCallback } from 'react';
import { Task } from '../types/task';
import { getWeekStart, addWeeks } from '../utils/weekHelpers';
import { pixelToWeekOffset } from '../utils/taskPositioning';

interface UseTimelineDragDropProps {
  onTaskMove: (taskId: string, newStartDate: Date) => void;
  timelineStartDate: Date;
}

/**
 * Custom hook for handling drag-and-drop operations in the timeline
 */
export function useTimelineDragDrop({
  onTaskMove,
  timelineStartDate,
}: UseTimelineDragDropProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

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
        // Calculate how many weeks to move
        const weeksDelta = Math.round(pixelToWeekOffset(delta.x));

        if (weeksDelta !== 0) {
          // Calculate new start date
          const newStartDate = getWeekStart(addWeeks(task.startDate, weeksDelta));
          onTaskMove(task.id, newStartDate);
        }
      }

      setActiveTask(null);
      setDragOffset({ x: 0, y: 0 });
    },
    [onTaskMove]
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  return {
    activeTask,
    dragOffset,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    isDragging: activeTask !== null,
  };
}
