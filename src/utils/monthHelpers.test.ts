import { describe, it, expect } from 'vitest';
import {
  getMonthStart,
  getMonthEnd,
  getDaysInMonth,
  getMonthsBetween,
  addMonths,
  formatMonthHeader,
  formatMonthRange,
  isCurrentMonth,
  generateMonths,
  calculateMonthWidth,
  calculateEndDateMonths,
  calculateDurationMonths,
} from './monthHelpers';
import { BASE_DAY_WIDTH } from '../constants';

describe('monthHelpers', () => {
  describe('getMonthStart', () => {
    it('should return the 1st for a mid-month date', () => {
      const result = getMonthStart(new Date('2024-01-15'));
      expect(result.getDate()).toBe(1);
      expect(result.getMonth()).toBe(0); // January
    });

    it('should return the same date if already the 1st', () => {
      const first = new Date('2024-03-01');
      expect(getMonthStart(first).getDate()).toBe(1);
      expect(getMonthStart(first).getMonth()).toBe(2);
    });
  });

  describe('getMonthEnd', () => {
    it('should return January 31 for a January date', () => {
      const result = getMonthEnd(new Date('2024-01-10'));
      expect(result.getDate()).toBe(31);
    });

    it('should return February 29 in a leap year', () => {
      const result = getMonthEnd(new Date('2024-02-01')); // 2024 is a leap year
      expect(result.getDate()).toBe(29);
    });

    it('should return February 28 in a non-leap year', () => {
      const result = getMonthEnd(new Date('2023-02-01'));
      expect(result.getDate()).toBe(28);
    });

    it('should return April 30', () => {
      expect(getMonthEnd(new Date('2024-04-15')).getDate()).toBe(30);
    });
  });

  describe('getDaysInMonth', () => {
    it('should return 31 for January', () => {
      expect(getDaysInMonth(new Date('2024-01-01'))).toBe(31);
    });

    it('should return 29 for February in a leap year', () => {
      expect(getDaysInMonth(new Date('2024-02-01'))).toBe(29);
    });

    it('should return 28 for February in a non-leap year', () => {
      expect(getDaysInMonth(new Date('2023-02-01'))).toBe(28);
    });

    it('should return 30 for April', () => {
      expect(getDaysInMonth(new Date('2024-04-01'))).toBe(30);
    });
  });

  describe('getMonthsBetween', () => {
    it('should return 0 for dates in the same month', () => {
      expect(getMonthsBetween(new Date('2024-01-01'), new Date('2024-01-31'))).toBe(0);
    });

    it('should return 1 for adjacent months', () => {
      expect(getMonthsBetween(new Date('2024-01-01'), new Date('2024-02-01'))).toBe(1);
    });

    it('should return 12 for one year apart', () => {
      expect(getMonthsBetween(new Date('2024-01-01'), new Date('2025-01-01'))).toBe(12);
    });

    it('should return negative when end is before start', () => {
      expect(getMonthsBetween(new Date('2024-03-01'), new Date('2024-01-01'))).toBe(-2);
    });
  });

  describe('addMonths', () => {
    it('should add months correctly', () => {
      const result = addMonths(new Date('2024-01-15'), 2);
      expect(result.getMonth()).toBe(2); // March
      expect(result.getDate()).toBe(15);
    });

    it('should wrap across year boundary', () => {
      const result = addMonths(new Date('2024-11-01'), 3);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(1); // February
    });

    it('should subtract months with negative value', () => {
      const result = addMonths(new Date('2024-03-01'), -2);
      expect(result.getMonth()).toBe(0); // January
    });
  });

  describe('formatMonthHeader', () => {
    it('should format as "MMM yyyy"', () => {
      expect(formatMonthHeader(new Date('2024-01-15'))).toBe('Jan 2024');
    });

    it('should format December correctly', () => {
      expect(formatMonthHeader(new Date('2024-12-01'))).toBe('Dec 2024');
    });
  });

  describe('formatMonthRange', () => {
    it('should format a range across months', () => {
      const result = formatMonthRange(new Date('2024-01-01'), new Date('2024-03-31'));
      expect(result).toBe('Jan 2024 - Mar 2024');
    });
  });

  describe('isCurrentMonth', () => {
    it('should return true for the current date', () => {
      expect(isCurrentMonth(new Date())).toBe(true);
    });

    it('should return false for a date far in the future', () => {
      expect(isCurrentMonth(new Date('2030-01-01'))).toBe(false);
    });
  });

  describe('generateMonths', () => {
    it('should generate the correct number of months', () => {
      const months = generateMonths(new Date('2024-01-01'), 6);
      expect(months).toHaveLength(6);
    });

    it('should generate consecutive months starting from the 1st', () => {
      const months = generateMonths(new Date('2024-01-15'), 3); // mid-month input
      expect(months[0].getDate()).toBe(1);
      expect(months[0].getMonth()).toBe(0); // Jan
      expect(months[1].getMonth()).toBe(1); // Feb
      expect(months[2].getMonth()).toBe(2); // Mar
    });
  });

  describe('calculateMonthWidth', () => {
    it('should return 31 * BASE_DAY_WIDTH for January', () => {
      expect(calculateMonthWidth(new Date('2024-01-01'))).toBeCloseTo(31 * BASE_DAY_WIDTH);
    });

    it('should return 29 * BASE_DAY_WIDTH for February in a leap year', () => {
      expect(calculateMonthWidth(new Date('2024-02-01'))).toBeCloseTo(29 * BASE_DAY_WIDTH);
    });

    it('should return 28 * BASE_DAY_WIDTH for February in a non-leap year', () => {
      expect(calculateMonthWidth(new Date('2023-02-01'))).toBeCloseTo(28 * BASE_DAY_WIDTH);
    });
  });

  describe('calculateEndDateMonths', () => {
    it('should return the last day of the start month for 1-month duration', () => {
      const end = calculateEndDateMonths(new Date('2024-01-01'), 1);
      expect(end.getMonth()).toBe(0); // January
      expect(end.getDate()).toBe(31);
    });

    it('should span multiple months', () => {
      const end = calculateEndDateMonths(new Date('2024-01-01'), 3);
      expect(end.getMonth()).toBe(2); // March
      expect(end.getDate()).toBe(31);
    });
  });

  describe('calculateDurationMonths', () => {
    it('should return 1 for dates within the same month', () => {
      expect(
        calculateDurationMonths(new Date('2024-01-01'), new Date('2024-01-31'))
      ).toBe(1);
    });

    it('should return 2 for a span of two months', () => {
      expect(
        calculateDurationMonths(new Date('2024-01-01'), new Date('2024-02-28'))
      ).toBe(2);
    });

    it('should return at least 1 even for same day', () => {
      const date = new Date('2024-01-15');
      expect(calculateDurationMonths(date, date)).toBe(1);
    });
  });
});
