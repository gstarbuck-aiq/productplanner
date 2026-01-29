import { describe, it, expect } from 'vitest';
import {
  getWeekStart,
  getWeekEnd,
  getWeekNumber,
  getWeeksBetween,
  addWeeks,
  formatWeekHeader,
  formatWeekRange,
  isCurrentWeek,
  generateWeeks,
  calculateEndDate,
  calculateDuration,
} from './weekHelpers';

describe('weekHelpers', () => {
  describe('getWeekStart', () => {
    it('should return Monday for a date in the middle of the week', () => {
      const wednesday = new Date('2024-01-10'); // Wednesday
      const result = getWeekStart(wednesday);
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(8); // Jan 8 is Monday
    });

    it('should return the same date if it is already Monday', () => {
      const monday = new Date('2024-01-08'); // Monday
      const result = getWeekStart(monday);
      expect(result.getTime()).toBe(monday.getTime());
    });
  });

  describe('getWeekEnd', () => {
    it('should return Sunday for a date in the middle of the week', () => {
      const wednesday = new Date('2024-01-10'); // Wednesday
      const result = getWeekEnd(wednesday);
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getDate()).toBe(14); // Jan 14 is Sunday
    });
  });

  describe('getWeekNumber', () => {
    it('should return the correct ISO week number', () => {
      const date = new Date('2024-01-10');
      const weekNum = getWeekNumber(date);
      expect(weekNum).toBeGreaterThan(0);
      expect(weekNum).toBeLessThanOrEqual(53);
    });
  });

  describe('getWeeksBetween', () => {
    it('should return 0 for dates in the same week', () => {
      const date1 = new Date('2024-01-08'); // Monday
      const date2 = new Date('2024-01-10'); // Wednesday
      expect(getWeeksBetween(date1, date2)).toBe(0);
    });

    it('should return 1 for dates one week apart', () => {
      const date1 = new Date('2024-01-08'); // Monday
      const date2 = new Date('2024-01-15'); // Next Monday
      expect(getWeeksBetween(date1, date2)).toBe(1);
    });

    it('should return positive number when end is after start', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-29');
      expect(getWeeksBetween(date1, date2)).toBeGreaterThan(0);
    });

    it('should return negative number when end is before start', () => {
      const date1 = new Date('2024-01-29');
      const date2 = new Date('2024-01-01');
      expect(getWeeksBetween(date1, date2)).toBeLessThan(0);
    });
  });

  describe('addWeeks', () => {
    it('should add weeks correctly', () => {
      const date = new Date('2024-01-08');
      const result = addWeeks(date, 2);
      expect(result.getDate()).toBe(22);
    });

    it('should subtract weeks with negative number', () => {
      const date = new Date('2024-01-22');
      const result = addWeeks(date, -2);
      expect(result.getDate()).toBe(8);
    });
  });

  describe('formatWeekHeader', () => {
    it('should format date as "MMM d"', () => {
      const date = new Date('2024-01-08');
      const result = formatWeekHeader(date);
      expect(result).toBe('Jan 8');
    });
  });

  describe('formatWeekRange', () => {
    it('should format date range correctly', () => {
      const start = new Date('2024-01-08');
      const end = new Date('2024-01-14');
      const result = formatWeekRange(start, end);
      expect(result).toBe('Jan 8 - Jan 14');
    });
  });

  describe('isCurrentWeek', () => {
    it('should return true for current date', () => {
      const now = new Date();
      expect(isCurrentWeek(now)).toBe(true);
    });

    it('should return false for date in a different week', () => {
      const farFuture = new Date('2030-01-01');
      expect(isCurrentWeek(farFuture)).toBe(false);
    });
  });

  describe('generateWeeks', () => {
    it('should generate correct number of weeks', () => {
      const start = new Date('2024-01-08');
      const weeks = generateWeeks(start, 5);
      expect(weeks).toHaveLength(5);
    });

    it('should generate sequential weeks', () => {
      const start = new Date('2024-01-08');
      const weeks = generateWeeks(start, 3);
      expect(weeks[1].getDate()).toBe(15);
      expect(weeks[2].getDate()).toBe(22);
    });

    it('should align to week start', () => {
      const midWeek = new Date('2024-01-10'); // Wednesday
      const weeks = generateWeeks(midWeek, 2);
      expect(weeks[0].getDay()).toBe(1); // Monday
    });
  });

  describe('calculateEndDate', () => {
    it('should calculate end date for 1 week duration', () => {
      const start = new Date('2024-01-08'); // Monday
      const end = calculateEndDate(start, 1);
      expect(end.getDay()).toBe(0); // Sunday
      expect(end.getDate()).toBe(14);
    });

    it('should calculate end date for multiple weeks', () => {
      const start = new Date('2024-01-08'); // Monday
      const end = calculateEndDate(start, 3);
      expect(end.getDay()).toBe(0); // Sunday
      expect(end.getDate()).toBe(28);
    });
  });

  describe('calculateDuration', () => {
    it('should return 1 for same week', () => {
      const start = new Date('2024-01-08');
      const end = new Date('2024-01-10');
      expect(calculateDuration(start, end)).toBe(1);
    });

    it('should return correct duration for multiple weeks', () => {
      const start = new Date('2024-01-08');
      const end = new Date('2024-01-28');
      expect(calculateDuration(start, end)).toBe(3);
    });

    it('should return at least 1 even for same day', () => {
      const date = new Date('2024-01-08');
      expect(calculateDuration(date, date)).toBe(1);
    });
  });
});
