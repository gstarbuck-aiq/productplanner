import { describe, it, expect } from 'vitest';
import {
  calculateStackPositions,
  calculateTaskDimensions,
  calculateTimelineHeight,
  pixelToWeekOffset,
  weekOffsetToPixel,
} from './taskPositioning';
import type { Task } from '../types/task';
import { TASK_HEIGHT, TASK_GAP, WEEK_WIDTH } from '../constants';

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

describe('taskPositioning', () => {
  describe('calculateStackPositions', () => {
    it('should return empty array for no tasks', () => {
      const result = calculateStackPositions([]);
      expect(result).toEqual([]);
    });

    it('should place single task at position 0', () => {
      const task = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-07'),
        1
      );
      const result = calculateStackPositions([task]);
      expect(result[0].stackPosition).toBe(0);
    });

    it('should place non-overlapping tasks at position 0', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-07'),
        1
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-15'),
        new Date('2024-01-21'),
        1
      );
      const result = calculateStackPositions([task1, task2]);
      expect(result[0].stackPosition).toBe(0);
      expect(result[1].stackPosition).toBe(0);
    });

    it('should stack overlapping tasks vertically', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-14'),
        2
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-08'),
        new Date('2024-01-21'),
        2
      );
      const result = calculateStackPositions([task1, task2]);
      expect(result[0].stackPosition).toBe(0);
      expect(result[1].stackPosition).toBe(1);
    });

    it('should handle three overlapping tasks', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-14'),
        2
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-08'),
        new Date('2024-01-21'),
        2
      );
      const task3 = createTask(
        '3',
        new Date('2024-01-10'),
        new Date('2024-01-24'),
        2
      );
      const result = calculateStackPositions([task1, task2, task3]);
      expect(result[0].stackPosition).toBe(0);
      expect(result[1].stackPosition).toBe(1);
      expect(result[2].stackPosition).toBe(2);
    });

    it('should reuse positions when tasks do not overlap', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-07'),
        1
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-02'),
        new Date('2024-01-08'),
        1
      );
      const task3 = createTask(
        '3',
        new Date('2024-01-15'),
        new Date('2024-01-21'),
        1
      );
      const result = calculateStackPositions([task1, task2, task3]);
      expect(result[0].stackPosition).toBe(0);
      expect(result[1].stackPosition).toBe(1);
      expect(result[2].stackPosition).toBe(0); // Reuses position 0
    });

    it('should find lowest available position', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-14'),
        2
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-05'),
        new Date('2024-01-18'),
        2
      );
      const task3 = createTask(
        '3',
        new Date('2024-01-08'),
        new Date('2024-01-21'),
        2
      );
      const task4 = createTask(
        '4',
        new Date('2024-01-03'),
        new Date('2024-01-16'),
        2
      );

      const result = calculateStackPositions([task1, task2, task3, task4]);
      const positions = result.map((t) => t.stackPosition);
      expect(Math.max(...positions)).toBeLessThanOrEqual(3);
    });
  });

  describe('calculateTaskDimensions', () => {
    it('should calculate correct dimensions for task at timeline start', () => {
      const timelineStart = new Date('2024-01-01');
      const task = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-14'),
        2
      );
      task.stackPosition = 0;

      const dimensions = calculateTaskDimensions(task, timelineStart);
      expect(dimensions.left).toBe(0);
      expect(dimensions.width).toBe(2 * WEEK_WIDTH);
      expect(dimensions.top).toBe(0);
      expect(dimensions.height).toBe(TASK_HEIGHT);
    });

    it('should calculate correct offset for task later in timeline', () => {
      const timelineStart = new Date('2024-01-01');
      const task = createTask(
        '1',
        new Date('2024-01-15'),
        new Date('2024-01-28'),
        2
      );
      task.stackPosition = 0;

      const dimensions = calculateTaskDimensions(task, timelineStart);
      expect(dimensions.left).toBe(2 * WEEK_WIDTH); // 2 weeks offset
      expect(dimensions.width).toBe(2 * WEEK_WIDTH);
    });

    it('should calculate correct vertical position for stacked task', () => {
      const timelineStart = new Date('2024-01-01');
      const task = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-14'),
        2
      );
      task.stackPosition = 2;

      const dimensions = calculateTaskDimensions(task, timelineStart);
      expect(dimensions.top).toBe(2 * (TASK_HEIGHT + TASK_GAP));
    });

    it('should handle long duration tasks', () => {
      const timelineStart = new Date('2024-01-01');
      const task = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-03-31'),
        12
      );
      task.stackPosition = 0;

      const dimensions = calculateTaskDimensions(task, timelineStart);
      expect(dimensions.width).toBe(12 * WEEK_WIDTH);
    });
  });

  describe('calculateTimelineHeight', () => {
    it('should return minimum height for empty tasks', () => {
      const height = calculateTimelineHeight([]);
      expect(height).toBe(TASK_HEIGHT + TASK_GAP);
    });

    it('should calculate height based on max stack position', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-07'),
        1
      );
      task1.stackPosition = 0;
      const task2 = createTask(
        '2',
        new Date('2024-01-01'),
        new Date('2024-01-07'),
        1
      );
      task2.stackPosition = 2;

      const height = calculateTimelineHeight([task1, task2]);
      expect(height).toBe(3 * (TASK_HEIGHT + TASK_GAP));
    });
  });

  describe('pixelToWeekOffset', () => {
    it('should convert pixel position to week offset', () => {
      expect(pixelToWeekOffset(0)).toBe(0);
      expect(pixelToWeekOffset(WEEK_WIDTH)).toBe(1);
      expect(pixelToWeekOffset(2 * WEEK_WIDTH)).toBe(2);
    });

    it('should round down for partial weeks', () => {
      expect(pixelToWeekOffset(WEEK_WIDTH - 1)).toBe(0);
      expect(pixelToWeekOffset(WEEK_WIDTH + 50)).toBe(1);
    });
  });

  describe('weekOffsetToPixel', () => {
    it('should convert week offset to pixel position', () => {
      expect(weekOffsetToPixel(0)).toBe(0);
      expect(weekOffsetToPixel(1)).toBe(WEEK_WIDTH);
      expect(weekOffsetToPixel(5)).toBe(5 * WEEK_WIDTH);
    });
  });
});
