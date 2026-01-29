import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { TaskProvider, useTasks } from './TaskContext';

describe('TaskContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should provide empty tasks initially', () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.tasks).toEqual([]);
    });
  });

  it('should add a task', () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    act(() => {
      result.current.addTask({
        title: 'Test Task',
        startDate: new Date('2024-01-01'),
        durationWeeks: 2,
        color: '#3b82f6',
      });
    });

    waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('Test Task');
      expect(result.current.tasks[0].durationWeeks).toBe(2);
    });
  });

  it('should delete a task', () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    let taskId: string;

    act(() => {
      taskId = result.current.addTask({
        title: 'Test Task',
        startDate: new Date('2024-01-01'),
        durationWeeks: 2,
        color: '#3b82f6',
      });
    });

    waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    act(() => {
      result.current.deleteTask(taskId);
    });

    waitFor(() => {
      expect(result.current.tasks).toHaveLength(0);
    });
  });

  it('should move a task', () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    let taskId: string;
    const initialDate = new Date('2024-01-01');
    const newDate = new Date('2024-01-15');

    act(() => {
      taskId = result.current.addTask({
        title: 'Test Task',
        startDate: initialDate,
        durationWeeks: 2,
        color: '#3b82f6',
      });
    });

    act(() => {
      result.current.moveTask(taskId, newDate);
    });

    waitFor(() => {
      const task = result.current.getTaskById(taskId);
      expect(task?.startDate.toISOString()).toBe(newDate.toISOString());
      expect(task?.durationWeeks).toBe(2); // Duration should stay the same
    });
  });

  it('should resize a task', () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    let taskId: string;
    const startDate = new Date('2024-01-01');

    act(() => {
      taskId = result.current.addTask({
        title: 'Test Task',
        startDate,
        durationWeeks: 2,
        color: '#3b82f6',
      });
    });

    act(() => {
      result.current.resizeTask(taskId, startDate, 4);
    });

    waitFor(() => {
      const task = result.current.getTaskById(taskId);
      expect(task?.durationWeeks).toBe(4);
    });
  });

  it('should update a task', () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    let taskId: string;

    act(() => {
      taskId = result.current.addTask({
        title: 'Test Task',
        startDate: new Date('2024-01-01'),
        durationWeeks: 2,
        color: '#3b82f6',
      });
    });

    waitFor(() => {
      const task = result.current.getTaskById(taskId);
      if (task) {
        act(() => {
          result.current.updateTask({
            ...task,
            title: 'Updated Task',
          });
        });
      }
    });

    waitFor(() => {
      const task = result.current.getTaskById(taskId);
      expect(task?.title).toBe('Updated Task');
    });
  });

  it('should calculate stack positions for overlapping tasks', () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    act(() => {
      result.current.addTask({
        title: 'Task 1',
        startDate: new Date('2024-01-01'),
        durationWeeks: 2,
        color: '#3b82f6',
      });

      result.current.addTask({
        title: 'Task 2',
        startDate: new Date('2024-01-08'),
        durationWeeks: 2,
        color: '#10b981',
      });
    });

    waitFor(() => {
      expect(result.current.tasks).toHaveLength(2);
      // Tasks should have different stack positions
      const positions = result.current.tasks.map((t) => t.stackPosition);
      expect(new Set(positions).size).toBeGreaterThan(1);
    });
  });
});
