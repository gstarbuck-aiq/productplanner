import { describe, it, expect } from 'vitest';
import {
  dateRangesOverlap,
  tasksOverlap,
  findOverlappingTasks,
  groupOverlappingTasks,
} from './collision';
import type { Task } from '../types/task';

const createTask = (
  id: string,
  startDate: Date,
  endDate: Date,
  durationWeeks: number = 1
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

describe('collision', () => {
  describe('dateRangesOverlap', () => {
    it('should detect overlapping ranges', () => {
      const start1 = new Date('2024-01-01');
      const end1 = new Date('2024-01-10');
      const start2 = new Date('2024-01-05');
      const end2 = new Date('2024-01-15');

      expect(dateRangesOverlap(start1, end1, start2, end2)).toBe(true);
    });

    it('should detect non-overlapping ranges', () => {
      const start1 = new Date('2024-01-01');
      const end1 = new Date('2024-01-10');
      const start2 = new Date('2024-01-11');
      const end2 = new Date('2024-01-20');

      expect(dateRangesOverlap(start1, end1, start2, end2)).toBe(false);
    });

    it('should detect touching ranges as overlapping', () => {
      const start1 = new Date('2024-01-01');
      const end1 = new Date('2024-01-10');
      const start2 = new Date('2024-01-10');
      const end2 = new Date('2024-01-20');

      expect(dateRangesOverlap(start1, end1, start2, end2)).toBe(true);
    });

    it('should detect when one range contains another', () => {
      const start1 = new Date('2024-01-01');
      const end1 = new Date('2024-01-31');
      const start2 = new Date('2024-01-10');
      const end2 = new Date('2024-01-20');

      expect(dateRangesOverlap(start1, end1, start2, end2)).toBe(true);
      expect(dateRangesOverlap(start2, end2, start1, end1)).toBe(true);
    });
  });

  describe('tasksOverlap', () => {
    it('should detect overlapping tasks', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-10'),
        2
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-05'),
        new Date('2024-01-15'),
        2
      );

      expect(tasksOverlap(task1, task2)).toBe(true);
    });

    it('should detect non-overlapping tasks', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-10'),
        2
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-15'),
        new Date('2024-01-25'),
        2
      );

      expect(tasksOverlap(task1, task2)).toBe(false);
    });
  });

  describe('findOverlappingTasks', () => {
    it('should find all overlapping tasks', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-10'),
        2
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-05'),
        new Date('2024-01-15'),
        2
      );
      const task3 = createTask(
        '3',
        new Date('2024-01-08'),
        new Date('2024-01-18'),
        2
      );
      const task4 = createTask(
        '4',
        new Date('2024-01-20'),
        new Date('2024-01-30'),
        2
      );

      const overlapping = findOverlappingTasks(task1, [task2, task3, task4]);
      expect(overlapping).toHaveLength(2);
      expect(overlapping.map((t) => t.id)).toEqual(
        expect.arrayContaining(['2', '3'])
      );
    });

    it('should exclude the task itself', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-10'),
        2
      );

      const overlapping = findOverlappingTasks(task1, [task1]);
      expect(overlapping).toHaveLength(0);
    });

    it('should return empty array when no overlaps', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-10'),
        2
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-20'),
        new Date('2024-01-30'),
        2
      );

      const overlapping = findOverlappingTasks(task1, [task2]);
      expect(overlapping).toHaveLength(0);
    });
  });

  describe('groupOverlappingTasks', () => {
    it('should return empty array for no tasks', () => {
      const groups = groupOverlappingTasks([]);
      expect(groups).toEqual([]);
    });

    it('should create one group for all overlapping tasks', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-10'),
        2
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-05'),
        new Date('2024-01-15'),
        2
      );
      const task3 = createTask(
        '3',
        new Date('2024-01-08'),
        new Date('2024-01-18'),
        2
      );

      const groups = groupOverlappingTasks([task1, task2, task3]);
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(3);
    });

    it('should create separate groups for non-overlapping tasks', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-10'),
        2
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-20'),
        new Date('2024-01-30'),
        2
      );

      const groups = groupOverlappingTasks([task1, task2]);
      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveLength(1);
      expect(groups[1]).toHaveLength(1);
    });

    it('should handle mixed overlapping and non-overlapping tasks', () => {
      const task1 = createTask(
        '1',
        new Date('2024-01-01'),
        new Date('2024-01-10'),
        2
      );
      const task2 = createTask(
        '2',
        new Date('2024-01-05'),
        new Date('2024-01-15'),
        2
      );
      const task3 = createTask(
        '3',
        new Date('2024-01-20'),
        new Date('2024-01-30'),
        2
      );

      const groups = groupOverlappingTasks([task1, task2, task3]);
      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveLength(2);
      expect(groups[1]).toHaveLength(1);
    });
  });
});
