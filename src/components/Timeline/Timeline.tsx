import React, { useEffect, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useTasks } from '../../context/TaskContext';
import { useTimelineScroll } from '../../hooks/useTimelineScroll';
import { useTimelineDragDrop } from '../../hooks/useTimelineDragDrop';
import { useTaskResize } from '../../hooks/useTaskResize';
import { WeekColumn } from './WeekColumn';
import { TaskBar } from './TaskBar';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';
import { Task } from '../../types/task';
import { calculateTimelineHeight } from '../../utils/taskPositioning';
import { WEEK_WIDTH } from '../../constants';
import './Timeline.css';

interface TimelineProps {
  onEditTask: (task: Task) => void;
}

export function Timeline({ onEditTask }: TimelineProps) {
  const { tasks, moveTask, resizeTask, deleteTask } = useTasks();
  const { timelineStart, visibleWeeks } = useTimelineScroll();
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);

  const { handleDragStart, handleDragEnd, handleDragCancel, activeTask } =
    useTimelineDragDrop({
      onTaskMove: moveTask,
      timelineStartDate: timelineStart,
    });

  const { startResize, handleResize, endResize, cancelResize, isResizing } =
    useTaskResize({
      onResizeComplete: resizeTask,
    });

  // Add global mouse event listeners for resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleResize(e, timelineStart);
    };

    const handleMouseUp = () => {
      endResize(timelineStart);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleResize, endResize, timelineStart]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const timelineHeight = calculateTimelineHeight(tasks);
  const timelineWidth = visibleWeeks.length * WEEK_WIDTH;

  const handleDeleteClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setDeleteConfirmTask(task);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmTask) {
      deleteTask(deleteConfirmTask.id);
      setDeleteConfirmTask(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="timeline-container">
        <div className="timeline-scroll">
          <div
            className="timeline-grid"
            style={{
              width: timelineWidth,
              minHeight: Math.max(timelineHeight, 400),
            }}
          >
            {/* Week columns */}
            <div className="week-columns">
              {visibleWeeks.map((weekStart, index) => (
                <WeekColumn
                  key={weekStart.toISOString()}
                  weekStart={weekStart}
                  index={index}
                />
              ))}
            </div>

            {/* Task bars */}
            <div className="task-layer">
              {tasks.map((task) => (
                <TaskBar
                  key={task.id}
                  task={task}
                  timelineStartDate={timelineStart}
                  onResizeStart={startResize}
                  onDelete={handleDeleteClick}
                  onEdit={onEditTask}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="empty-state">
            <p>No tasks yet. Click "Add Task" to get started.</p>
          </div>
        )}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask && (
          <div
            className="task-bar-overlay"
            style={{
              backgroundColor: activeTask.color,
              width: activeTask.durationWeeks * WEEK_WIDTH,
            }}
          >
            <span className="task-title">
              {activeTask.title} ({activeTask.durationWeeks}w)
            </span>
          </div>
        )}
      </DragOverlay>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmTask !== null}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteConfirmTask?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </DndContext>
  );
}
