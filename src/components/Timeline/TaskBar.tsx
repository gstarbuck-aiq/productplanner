import type { CSSProperties, MouseEvent } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../../types/task';
import type { ViewMode } from '../../types/timeline';
import type { ResizeHandle } from '../../hooks/useTaskResize';
import { calculateTaskDimensions } from '../../utils/taskPositioning';
import './TaskBar.css';

interface TaskBarProps {
  task: Task;
  timelineStartDate: Date;
  viewMode: ViewMode;
  onResizeStart?: (task: Task, handle: ResizeHandle, clientX: number) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
}

export function TaskBar({ task, timelineStartDate, viewMode, onResizeStart, onDelete, onEdit }: TaskBarProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
    });

  const dimensions = calculateTaskDimensions(task, timelineStartDate, viewMode);

  const style: CSSProperties = {
    position: 'absolute',
    left: dimensions.left,
    top: dimensions.top,
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: task.color,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const handleResizeMouseDown = (handle: ResizeHandle) => (e: MouseEvent) => {
    e.stopPropagation();
    if (onResizeStart) {
      onResizeStart(task, handle, e.clientX);
    }
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="task-bar"
      style={style}
      title={`${task.title} (${task.durationWeeks}w)`}
      {...attributes}
      {...listeners}
    >
      {onResizeStart && (
        <div
          className="resize-handle resize-handle-left"
          onMouseDown={handleResizeMouseDown('left')}
          title="Resize from start"
        />
      )}
      <span className="task-title">
        {task.title} ({task.durationWeeks}w)
      </span>
      <div className="task-actions">
        {onEdit && (
          <button
            className="task-action-btn task-edit-btn"
            onClick={handleEdit}
            title="Edit task"
            aria-label="Edit task"
          >
            ✎
          </button>
        )}
        {onDelete && (
          <button
            className="task-action-btn task-delete-btn"
            onClick={handleDelete}
            title="Delete task"
            aria-label="Delete task"
          >
            ✕
          </button>
        )}
      </div>
      {onResizeStart && (
        <div
          className="resize-handle resize-handle-right"
          onMouseDown={handleResizeMouseDown('right')}
          title="Resize from end"
        />
      )}
    </div>
  );
}
