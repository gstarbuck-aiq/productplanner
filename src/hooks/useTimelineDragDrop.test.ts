import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimelineDragDrop } from './useTimelineDragDrop';
import type { Task } from '../types/task';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { WEEK_WIDTH } from '../constants';
import { calculateEndDate, getWeekStart, addWeeks } from '../utils/weekHelpers';
import { calculateMonthWidth } from '../utils/monthHelpers';

const JAN_8 = new Date('2024-01-08');  // Monday — week-view anchor
const JAN_1 = new Date('2024-01-01');  // Month start — month-view anchor

function makeTask(startDate: Date, durationWeeks: number): Task {
  return {
    id: 'task-1',
    title: 'Test',
    startDate,
    endDate: calculateEndDate(startDate, durationWeeks),
    durationWeeks,
    color: '#3b82f6',
    stackPosition: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeDragStartEvent(task: Task): DragStartEvent {
  return {
    active: {
      id: task.id,
      data: { current: { task } },
      rect: { current: { translated: null, initial: null } },
    },
    activatorEvent: new Event('pointerdown'),
  } as unknown as DragStartEvent;
}

function makeDragEndEvent(task: Task, deltaX: number, translatedLeft = 0): DragEndEvent {
  return {
    active: {
      id: task.id,
      data: { current: { task } },
      rect: {
        current: {
          translated: { left: translatedLeft, top: 0, right: 0, bottom: 0, width: 0, height: 0 },
          initial: null,
        },
      },
    },
    over: null,
    delta: { x: deltaX, y: 0 },
    activatorEvent: new Event('pointerdown'),
    collisions: [],
  } as unknown as DragEndEvent;
}

describe('useTimelineDragDrop', () => {
  it('should have activeTask as null initially', () => {
    const { result } = renderHook(() =>
      useTimelineDragDrop({
        onTaskMove: vi.fn(),
        timelineStartDate: JAN_8,
        viewMode: 'week',
      })
    );
    expect(result.current.activeTask).toBeNull();
    expect(result.current.isDragging).toBe(false);
  });

  it('should set activeTask on dragStart', () => {
    const task = makeTask(JAN_8, 2);
    const { result } = renderHook(() =>
      useTimelineDragDrop({
        onTaskMove: vi.fn(),
        timelineStartDate: JAN_8,
        viewMode: 'week',
      })
    );

    act(() => {
      result.current.handleDragStart(makeDragStartEvent(task));
    });

    expect(result.current.activeTask?.id).toBe(task.id);
    expect(result.current.isDragging).toBe(true);
  });

  it('should clear activeTask on dragCancel', () => {
    const task = makeTask(JAN_8, 2);
    const { result } = renderHook(() =>
      useTimelineDragDrop({
        onTaskMove: vi.fn(),
        timelineStartDate: JAN_8,
        viewMode: 'week',
      })
    );

    act(() => { result.current.handleDragStart(makeDragStartEvent(task)); });
    act(() => { result.current.handleDragCancel(); });

    expect(result.current.activeTask).toBeNull();
    expect(result.current.isDragging).toBe(false);
  });

  describe('week view', () => {
    it('should not call onTaskMove when delta is 0', () => {
      const onTaskMove = vi.fn();
      const task = makeTask(JAN_8, 2);

      const { result } = renderHook(() =>
        useTimelineDragDrop({ onTaskMove, timelineStartDate: JAN_8, viewMode: 'week' })
      );

      act(() => {
        result.current.handleDragEnd(makeDragEndEvent(task, 0));
      });

      expect(onTaskMove).not.toHaveBeenCalled();
    });

    it('should not call onTaskMove when delta is less than half a week', () => {
      const onTaskMove = vi.fn();
      const task = makeTask(JAN_8, 2);

      const { result } = renderHook(() =>
        useTimelineDragDrop({ onTaskMove, timelineStartDate: JAN_8, viewMode: 'week' })
      );

      act(() => {
        // Math.round(pixelToWeekOffset(30)) = Math.round(0.3) = 0 → weeksDelta = 0
        result.current.handleDragEnd(makeDragEndEvent(task, 30));
      });

      expect(onTaskMove).not.toHaveBeenCalled();
    });

    it('should move task forward by 1 week when dragged right by WEEK_WIDTH', () => {
      const onTaskMove = vi.fn();
      const task = makeTask(JAN_8, 2);

      const { result } = renderHook(() =>
        useTimelineDragDrop({ onTaskMove, timelineStartDate: JAN_8, viewMode: 'week' })
      );

      act(() => {
        result.current.handleDragEnd(makeDragEndEvent(task, WEEK_WIDTH));
      });

      expect(onTaskMove).toHaveBeenCalledOnce();
      const [taskId, newDate] = onTaskMove.mock.calls[0];
      expect(taskId).toBe(task.id);
      // Expected: Jan 8 + 1 week = Jan 15
      const expected = getWeekStart(addWeeks(JAN_8, 1));
      expect(newDate.getTime()).toBe(expected.getTime());
    });

    it('should move task backward by 2 weeks when dragged left', () => {
      const onTaskMove = vi.fn();
      const startDate = new Date('2024-01-22'); // Jan 22 (Monday)
      const task = makeTask(startDate, 2);

      const { result } = renderHook(() =>
        useTimelineDragDrop({ onTaskMove, timelineStartDate: JAN_8, viewMode: 'week' })
      );

      act(() => {
        result.current.handleDragEnd(makeDragEndEvent(task, -2 * WEEK_WIDTH));
      });

      const [, newDate] = onTaskMove.mock.calls[0];
      // Expected: Jan 22 - 2 weeks = Jan 8
      const expected = getWeekStart(addWeeks(startDate, -2));
      expect(newDate.getTime()).toBe(expected.getTime());
    });

    it('should clear activeTask after dragEnd', () => {
      const task = makeTask(JAN_8, 2);
      const { result } = renderHook(() =>
        useTimelineDragDrop({ onTaskMove: vi.fn(), timelineStartDate: JAN_8, viewMode: 'week' })
      );

      act(() => { result.current.handleDragStart(makeDragStartEvent(task)); });
      act(() => { result.current.handleDragEnd(makeDragEndEvent(task, WEEK_WIDTH)); });

      expect(result.current.activeTask).toBeNull();
    });
  });

  describe('month view', () => {
    it('should not call onTaskMove when drag stays in the same month', () => {
      const onTaskMove = vi.fn();
      // Task starts Jan 1; dragging by 5px stays in January
      const task = makeTask(JAN_1, 2);

      const { result } = renderHook(() =>
        useTimelineDragDrop({ onTaskMove, timelineStartDate: JAN_1, viewMode: 'month' })
      );

      act(() => {
        // translatedLeft=0, deltaX=5 → targetPixel=5 → still January → no move
        result.current.handleDragEnd(makeDragEndEvent(task, 5, 0));
      });

      expect(onTaskMove).not.toHaveBeenCalled();
    });

    it('should move task to next month when dragged past the month boundary', () => {
      const onTaskMove = vi.fn();
      const task = makeTask(JAN_1, 2);
      const janWidth = calculateMonthWidth(JAN_1); // 31 * BASE_DAY_WIDTH

      const { result } = renderHook(() =>
        useTimelineDragDrop({ onTaskMove, timelineStartDate: JAN_1, viewMode: 'month' })
      );

      act(() => {
        // translatedLeft=0 + deltaX=(janWidth + 10) → deep into February
        result.current.handleDragEnd(makeDragEndEvent(task, janWidth + 10, 0));
      });

      expect(onTaskMove).toHaveBeenCalledOnce();
      const [taskId, newDate] = onTaskMove.mock.calls[0];
      expect(taskId).toBe(task.id);
      expect(newDate.getMonth()).toBe(1); // February
      expect(newDate.getDate()).toBe(1);  // month start
    });

    it('should snap to month start regardless of day within the target month', () => {
      const onTaskMove = vi.fn();
      const task = makeTask(JAN_1, 1);
      const janWidth = calculateMonthWidth(JAN_1);

      const { result } = renderHook(() =>
        useTimelineDragDrop({ onTaskMove, timelineStartDate: JAN_1, viewMode: 'month' })
      );

      // Drag to mid-February
      act(() => {
        result.current.handleDragEnd(makeDragEndEvent(task, janWidth + 100, 0));
      });

      const [, newDate] = onTaskMove.mock.calls[0];
      // Should snap to Feb 1 regardless of where in Feb the pixel lands
      expect(newDate.getDate()).toBe(1);
    });
  });
});
