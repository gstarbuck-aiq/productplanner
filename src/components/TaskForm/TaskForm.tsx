import React, { useState, FormEvent, useEffect } from 'react';
import { useTasks } from '../../context/TaskContext';
import { Task } from '../../types/task';
import { getWeekStart, calculateEndDate } from '../../utils/weekHelpers';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { COLOR_PALETTE, MIN_TASK_DURATION } from '../../constants';
import './TaskForm.css';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task | null;
}

export function TaskForm({ isOpen, onClose, editTask }: TaskFormProps) {
  const { addTask, updateTask } = useTasks();
  const isEditMode = !!editTask;
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(1);
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [errors, setErrors] = useState<{ title?: string; duration?: string }>(
    {}
  );

  // Reset or populate form when opened
  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        // Populate with existing task data
        setTitle(editTask.title);
        setStartDate(editTask.startDate.toISOString().split('T')[0]);
        setDurationWeeks(editTask.durationWeeks);
        setColor(editTask.color);
      } else {
        // Reset for new task
        setTitle('');
        const today = new Date();
        const weekStart = getWeekStart(today);
        setStartDate(weekStart.toISOString().split('T')[0]);
        setDurationWeeks(1);
        setColor(COLOR_PALETTE[0]);
      }
      setErrors({});
    }
  }, [isOpen, editTask]);

  const validate = (): boolean => {
    const newErrors: { title?: string; duration?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (durationWeeks < MIN_TASK_DURATION) {
      newErrors.duration = `Duration must be at least ${MIN_TASK_DURATION} week`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const taskStartDate = getWeekStart(new Date(startDate));

    if (isEditMode && editTask) {
      // Update existing task
      updateTask({
        ...editTask,
        title: title.trim(),
        startDate: taskStartDate,
        durationWeeks,
        color,
        endDate: calculateEndDate(taskStartDate, durationWeeks),
      });
    } else {
      // Create new task
      addTask({
        title: title.trim(),
        startDate: taskStartDate,
        durationWeeks,
        color,
      });
    }

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [
      {
        key: 'Escape',
        handler: (e) => {
          e.preventDefault();
          handleCancel();
        },
      },
    ],
    isOpen
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Task' : 'Add New Task'}</h2>
          <button
            className="close-button"
            onClick={handleCancel}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="task-title">
              Title <span className="required">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? 'error' : ''}
              placeholder="Enter task title"
              autoFocus
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start-date">Start Week</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">
                Duration (weeks) <span className="required">*</span>
              </label>
              <input
                id="duration"
                type="number"
                min={MIN_TASK_DURATION}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value, 10))}
                className={errors.duration ? 'error' : ''}
              />
              {errors.duration && (
                <span className="error-message">{errors.duration}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-palette">
              {COLOR_PALETTE.map((paletteColor) => (
                <button
                  key={paletteColor}
                  type="button"
                  className={`color-swatch ${
                    color === paletteColor ? 'selected' : ''
                  }`}
                  style={{ backgroundColor: paletteColor }}
                  onClick={() => setColor(paletteColor)}
                  aria-label={`Select color ${paletteColor}`}
                  title={paletteColor}
                />
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              {isEditMode ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
