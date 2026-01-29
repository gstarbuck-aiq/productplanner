import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTaskStacking } from './useTaskStacking';
import { Task } from '../types/task';

const createTask = (
  id: string,
  startDate: Date,
  endDate: Date,
  durationWeeks: number
): Task => ({
  id,
  title: `Task ${id}`,
  startDate,
  endDate,
  durationWeeks,
  color: '#3b82f6',
  stackPosition: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('useTaskStacking', () => {
  it('should return empty array for no tasks', () => {
    const { result } = renderHook(() => useTaskStacking([]));
    expect(result.current).toEqual([]);
  });

  it('should calculate stack positions for tasks', () => {
    const tasks = [
      createTask('1', new Date('2024-01-01'), new Date('2024-01-14'), 2),
      createTask('2', new Date('2024-01-08'), new Date('2024-01-21'), 2),
    ];

    const { result } = renderHook(() => useTaskStacking(tasks));

    expect(result.current[0].stackPosition).toBe(0);
    expect(result.current[1].stackPosition).toBe(1);
  });

  it('should recalculate when tasks change', () => {
    const initialTasks = [
      createTask('1', new Date('2024-01-01'), new Date('2024-01-14'), 2),
    ];

    const { result, rerender } = renderHook(
      ({ tasks }) => useTaskStacking(tasks),
      { initialProps: { tasks: initialTasks } }
    );

    expect(result.current).toHaveLength(1);

    const newTasks = [
      ...initialTasks,
      createTask('2', new Date('2024-01-08'), new Date('2024-01-21'), 2),
    ];

    rerender({ tasks: newTasks });

    expect(result.current).toHaveLength(2);
    expect(result.current[1].stackPosition).toBe(1);
  });

  it('should memoize result when tasks array reference stays same', () => {
    const tasks = [
      createTask('1', new Date('2024-01-01'), new Date('2024-01-14'), 2),
    ];

    const { result, rerender } = renderHook(() => useTaskStacking(tasks));
    const firstResult = result.current;

    rerender();
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });
});
