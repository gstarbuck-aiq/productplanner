import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskResize } from './useTaskResize';
import type { Task } from '../types/task';
import { WEEK_WIDTH } from '../constants';
import { calculateEndDate } from '../utils/weekHelpers';
import { calculatePixelOffset } from '../utils/timeHelpers';

// Stable dates to anchor all date arithmetic
const JAN_8 = new Date('2024-01-08'); // Monday
const JAN_1 = new Date('2024-01-01'); // Month start — used in month-view tests

function makeTask(startDate: Date, durationWeeks: number): Task {
  return {
    id: 'task-1',
    title: 'Test Task',
    startDate,
    endDate: calculateEndDate(startDate, durationWeeks),
    durationWeeks,
    color: '#3b82f6',
    stackPosition: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('useTaskResize', () => {
  beforeEach(() => {
    // Make RAF execute synchronously so hook state updates are predictable
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should not be resizing initially', () => {
    const { result } = renderHook(() =>
      useTaskResize({ onResizeComplete: vi.fn(), viewMode: 'week' })
    );
    expect(result.current.isResizing).toBe(false);
    expect(result.current.resizingTask).toBeNull();
  });

  it('should set isResizing to true after startResize', () => {
    const { result } = renderHook(() =>
      useTaskResize({ onResizeComplete: vi.fn(), viewMode: 'week' })
    );
    const task = makeTask(JAN_8, 4);

    act(() => {
      result.current.startResize(task, 'right', 100);
    });

    expect(result.current.isResizing).toBe(true);
    expect(result.current.resizingTask?.task.id).toBe(task.id);
    expect(result.current.resizingTask?.handle).toBe('right');
  });

  it('should clear state after cancelResize', () => {
    const { result } = renderHook(() =>
      useTaskResize({ onResizeComplete: vi.fn(), viewMode: 'week' })
    );

    act(() => {
      result.current.startResize(makeTask(JAN_8, 4), 'right', 100);
    });
    act(() => {
      result.current.cancelResize();
    });

    expect(result.current.isResizing).toBe(false);
    expect(result.current.resizingTask).toBeNull();
  });

  it('should not call onResizeComplete when endResize is called with no active resize', () => {
    const onResizeComplete = vi.fn();
    const { result } = renderHook(() =>
      useTaskResize({ onResizeComplete, viewMode: 'week' })
    );

    act(() => {
      result.current.endResize(JAN_8);
    });

    expect(onResizeComplete).not.toHaveBeenCalled();
  });

  describe('week view — right handle', () => {
    it('should increase duration when dragging right by one week', () => {
      const onResizeComplete = vi.fn();
      const task = makeTask(JAN_8, 4);

      const { result } = renderHook(() =>
        useTaskResize({ onResizeComplete, viewMode: 'week' })
      );

      act(() => {
        result.current.startResize(task, 'right', 0); // initialX = 0
      });
      act(() => {
        // Move right by exactly 1 week in pixels
        result.current.handleResize({ clientX: WEEK_WIDTH } as MouseEvent, JAN_8);
      });
      act(() => {
        result.current.endResize(JAN_8);
      });

      expect(onResizeComplete).toHaveBeenCalledOnce();
      const [, , newDuration] = onResizeComplete.mock.calls[0];
      expect(newDuration).toBe(5); // 4 + 1
    });

    it('should decrease duration when dragging left', () => {
      const onResizeComplete = vi.fn();
      const task = makeTask(JAN_8, 4);

      const { result } = renderHook(() =>
        useTaskResize({ onResizeComplete, viewMode: 'week' })
      );

      act(() => { result.current.startResize(task, 'right', 0); });
      act(() => {
        result.current.handleResize({ clientX: -2 * WEEK_WIDTH } as MouseEvent, JAN_8);
      });
      act(() => { result.current.endResize(JAN_8); });

      const [, , newDuration] = onResizeComplete.mock.calls[0];
      expect(newDuration).toBe(2); // 4 - 2
    });

    it('should enforce minimum duration of 1 when dragging too far left', () => {
      const onResizeComplete = vi.fn();
      const task = makeTask(JAN_8, 2);

      const { result } = renderHook(() =>
        useTaskResize({ onResizeComplete, viewMode: 'week' })
      );

      act(() => { result.current.startResize(task, 'right', 0); });
      act(() => {
        // Try to shrink by 10 weeks — way more than duration
        result.current.handleResize({ clientX: -10 * WEEK_WIDTH } as MouseEvent, JAN_8);
      });
      act(() => { result.current.endResize(JAN_8); });

      const [, , newDuration] = onResizeComplete.mock.calls[0];
      expect(newDuration).toBe(1);
    });
  });

  describe('week view — left handle', () => {
    it('should move start date forward and shorten duration', () => {
      const onResizeComplete = vi.fn();
      const task = makeTask(JAN_8, 4); // ends Feb 4 (Sun)

      const { result } = renderHook(() =>
        useTaskResize({ onResizeComplete, viewMode: 'week' })
      );

      act(() => { result.current.startResize(task, 'left', 0); });
      act(() => {
        // Drag right by 1 week: new start = Jan 15
        result.current.handleResize({ clientX: WEEK_WIDTH } as MouseEvent, JAN_8);
      });
      act(() => { result.current.endResize(JAN_8); });

      const [, newStart, newDuration] = onResizeComplete.mock.calls[0];
      expect(newStart.getDate()).toBe(15); // Jan 15
      expect(newDuration).toBe(3); // 4 - 1
    });

    it('should move start date backward and lengthen duration', () => {
      const onResizeComplete = vi.fn();
      const task = makeTask(new Date('2024-01-15'), 2); // starts Jan 15

      const { result } = renderHook(() =>
        useTaskResize({ onResizeComplete, viewMode: 'week' })
      );

      act(() => { result.current.startResize(task, 'left', 0); });
      act(() => {
        // Drag left by 1 week: new start = Jan 8
        result.current.handleResize({ clientX: -WEEK_WIDTH } as MouseEvent, JAN_8);
      });
      act(() => { result.current.endResize(JAN_8); });

      const [, newStart, newDuration] = onResizeComplete.mock.calls[0];
      expect(newStart.getDate()).toBe(8); // Jan 8
      expect(newDuration).toBe(3); // 2 + 1
    });
  });

  describe('month view — right handle', () => {
    it('should increase duration when dragging right across a month boundary', () => {
      const onResizeComplete = vi.fn();
      // Task: Jan 1, 2 weeks. End date ≈ Jan 14.
      const task = makeTask(JAN_1, 2);
      const timelineStart = JAN_1;

      const { result } = renderHook(() =>
        useTaskResize({ onResizeComplete, viewMode: 'month' })
      );

      // initialX at the task's end date pixel position
      const initialEndPixel = calculatePixelOffset('month', timelineStart, task.endDate);

      act(() => { result.current.startResize(task, 'right', initialEndPixel); });
      act(() => {
        // Move right by 200px — into the next month
        result.current.handleResize(
          { clientX: initialEndPixel + 200 } as MouseEvent,
          timelineStart
        );
      });
      act(() => { result.current.endResize(timelineStart); });

      expect(onResizeComplete).toHaveBeenCalledOnce();
      const [, , newDuration] = onResizeComplete.mock.calls[0];
      expect(newDuration).toBeGreaterThan(task.durationWeeks);
    });

    it('should enforce minimum duration when dragging too far left', () => {
      const onResizeComplete = vi.fn();
      const task = makeTask(JAN_1, 2);
      const timelineStart = JAN_1;
      const initialEndPixel = calculatePixelOffset('month', timelineStart, task.endDate);

      const { result } = renderHook(() =>
        useTaskResize({ onResizeComplete, viewMode: 'month' })
      );

      act(() => { result.current.startResize(task, 'right', initialEndPixel); });
      act(() => {
        // Drag far left — beyond the start of the task
        result.current.handleResize({ clientX: 0 } as MouseEvent, timelineStart);
      });
      act(() => { result.current.endResize(timelineStart); });

      const [, , newDuration] = onResizeComplete.mock.calls[0];
      expect(newDuration).toBeGreaterThanOrEqual(1);
    });
  });

  describe('month view — left handle', () => {
    it('should return null (no callback) when proposed start is past the end date', () => {
      const onResizeComplete = vi.fn();
      // 1-week task: start and end are very close
      const task = makeTask(JAN_1, 1);
      const timelineStart = JAN_1;

      const { result } = renderHook(() =>
        useTaskResize({ onResizeComplete, viewMode: 'month' })
      );

      const initialStartPixel = calculatePixelOffset('month', timelineStart, task.startDate);

      act(() => { result.current.startResize(task, 'left', initialStartPixel); });
      act(() => {
        // Drag far right: proposed start moves past the end date
        result.current.handleResize({ clientX: initialStartPixel + 600 } as MouseEvent, timelineStart);
      });
      act(() => { result.current.endResize(timelineStart); });

      // Result was null so onResizeComplete should NOT be called
      expect(onResizeComplete).not.toHaveBeenCalled();
    });

    it('should shorten duration when dragging start forward', () => {
      const onResizeComplete = vi.fn();
      // 6-week task starting Jan 1
      const task = makeTask(JAN_1, 6);
      const timelineStart = JAN_1;
      const initialStartPixel = calculatePixelOffset('month', timelineStart, task.startDate); // 0

      const { result } = renderHook(() =>
        useTaskResize({ onResizeComplete, viewMode: 'month' })
      );

      act(() => { result.current.startResize(task, 'left', initialStartPixel); });
      act(() => {
        // Drag right into mid-January — shrinks from the left
        result.current.handleResize({ clientX: 100 } as MouseEvent, timelineStart);
      });
      act(() => { result.current.endResize(timelineStart); });

      expect(onResizeComplete).toHaveBeenCalledOnce();
      const [, , newDuration] = onResizeComplete.mock.calls[0];
      expect(newDuration).toBeLessThan(task.durationWeeks);
    });
  });
});
