import { describe, it, expect } from 'vitest';
import {
  getTimeUnitWidth,
  getTimeUnitStart,
  getTimeUnitsBetween,
  generateTimeUnits,
  formatTimeUnitHeader,
  addTimeUnits,
  calculateTaskWidth,
  calculateMonthSpanWidth,
  calculatePixelOffset,
  pixelToDate,
  getDaysBetween,
} from './timeHelpers';
import type { Task } from '../types/task';
import { WEEK_WIDTH, BASE_DAY_WIDTH } from '../constants';
import { calculateMonthWidth } from './monthHelpers';
import { calculateEndDate } from './weekHelpers';

// Pinned Monday — all week-view tests anchor to this date
const JAN_8 = new Date('2024-01-08'); // Monday
const JAN_1 = new Date('2024-01-01'); // Monday (timeline month start)

function makeTask(startDate: Date, durationWeeks: number): Task {
  return {
    id: 'test',
    title: 'Test',
    startDate,
    endDate: calculateEndDate(startDate, durationWeeks),
    durationWeeks,
    color: '#000',
    stackPosition: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('timeHelpers', () => {
  describe('getTimeUnitWidth', () => {
    it('should return WEEK_WIDTH in week view', () => {
      expect(getTimeUnitWidth('week')).toBe(WEEK_WIDTH);
    });

    it('should return day-count × BASE_DAY_WIDTH in month view for January', () => {
      expect(getTimeUnitWidth('month', new Date('2024-01-01'))).toBeCloseTo(31 * BASE_DAY_WIDTH);
    });

    it('should return a different width for February (fewer days)', () => {
      const jan = getTimeUnitWidth('month', new Date('2024-01-01'));
      const feb = getTimeUnitWidth('month', new Date('2024-02-01'));
      expect(feb).toBeLessThan(jan);
    });

    it('should throw in month view when no date is provided', () => {
      expect(() => getTimeUnitWidth('month')).toThrow();
    });
  });

  describe('getTimeUnitStart', () => {
    it('should return week start (Monday) in week view', () => {
      const wednesday = new Date('2024-01-10');
      const result = getTimeUnitStart('week', wednesday);
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(8);
    });

    it('should return month start in month view', () => {
      const result = getTimeUnitStart('month', new Date('2024-01-15'));
      expect(result.getDate()).toBe(1);
      expect(result.getMonth()).toBe(0);
    });
  });

  describe('getTimeUnitsBetween', () => {
    it('should return weeks between dates in week view', () => {
      expect(getTimeUnitsBetween('week', JAN_8, new Date('2024-01-22'))).toBe(2);
    });

    it('should return months between dates in month view', () => {
      expect(
        getTimeUnitsBetween('month', new Date('2024-01-01'), new Date('2024-04-01'))
      ).toBe(3);
    });
  });

  describe('generateTimeUnits', () => {
    it('should generate the correct number of weeks', () => {
      expect(generateTimeUnits('week', JAN_8, 4)).toHaveLength(4);
    });

    it('should generate the correct number of months', () => {
      expect(generateTimeUnits('month', JAN_1, 3)).toHaveLength(3);
    });

    it('should generate sequential weeks', () => {
      const units = generateTimeUnits('week', JAN_8, 2);
      expect(units[1].getDate()).toBe(15); // Jan 15
    });
  });

  describe('formatTimeUnitHeader', () => {
    it('should format a week header as "MMM d"', () => {
      expect(formatTimeUnitHeader('week', JAN_8)).toBe('Jan 8');
    });

    it('should format a month header as "MMM yyyy"', () => {
      expect(formatTimeUnitHeader('month', JAN_1)).toBe('Jan 2024');
    });
  });

  describe('addTimeUnits', () => {
    it('should add weeks in week view', () => {
      const result = addTimeUnits('week', JAN_8, 2);
      expect(result.getDate()).toBe(22);
    });

    it('should add months in month view', () => {
      const result = addTimeUnits('month', JAN_1, 2);
      expect(result.getMonth()).toBe(2); // March
    });
  });

  describe('getDaysBetween', () => {
    it('should return 0 for the same day', () => {
      expect(getDaysBetween(JAN_8, JAN_8)).toBe(0);
    });

    it('should return 7 for dates one week apart', () => {
      expect(getDaysBetween(JAN_8, new Date('2024-01-15'))).toBe(7);
    });

    it('should return 31 from Jan 1 to Feb 1', () => {
      expect(getDaysBetween(JAN_1, new Date('2024-02-01'))).toBe(31);
    });
  });

  describe('calculateMonthSpanWidth', () => {
    it('should span 0 extra days for a same-day range', () => {
      // (0 days diff + 1) * BASE_DAY_WIDTH
      expect(calculateMonthSpanWidth(JAN_1, JAN_1)).toBeCloseTo(BASE_DAY_WIDTH);
    });

    it('should match a full-month column width for a whole January span', () => {
      const jan31 = new Date('2024-01-31');
      // days = 30, width = 31 * BASE_DAY_WIDTH = January column width
      expect(calculateMonthSpanWidth(JAN_1, jan31)).toBeCloseTo(calculateMonthWidth(JAN_1));
    });
  });

  describe('calculateTaskWidth', () => {
    it('should be durationWeeks × WEEK_WIDTH in week view', () => {
      const task = makeTask(JAN_8, 3);
      expect(calculateTaskWidth('week', task)).toBe(3 * WEEK_WIDTH);
    });

    it('should use day-based width in month view', () => {
      // 4-week task: startDate Jan 8, endDate Feb 4 (Sun)
      const task = makeTask(JAN_8, 4);
      const days = getDaysBetween(task.startDate, task.endDate); // 27 days (Jan 8 → Feb 4)
      const expected = (days + 1) * BASE_DAY_WIDTH;
      expect(calculateTaskWidth('month', task)).toBeCloseTo(expected);
    });

    it('should return wider widths in month view for longer tasks', () => {
      const short = makeTask(JAN_8, 2);
      const long = makeTask(JAN_8, 8);
      expect(calculateTaskWidth('month', long)).toBeGreaterThan(calculateTaskWidth('month', short));
    });
  });

  describe('calculatePixelOffset', () => {
    describe('week view', () => {
      it('should return 0 when target equals timeline start', () => {
        expect(calculatePixelOffset('week', JAN_8, JAN_8)).toBe(0);
      });

      it('should return WEEK_WIDTH for one week later', () => {
        const oneWeekLater = new Date('2024-01-15');
        expect(calculatePixelOffset('week', JAN_8, oneWeekLater)).toBe(WEEK_WIDTH);
      });

      it('should return N × WEEK_WIDTH for N weeks later', () => {
        const threeWeeksLater = new Date('2024-01-29');
        expect(calculatePixelOffset('week', JAN_8, threeWeeksLater)).toBe(3 * WEEK_WIDTH);
      });
    });

    describe('month view', () => {
      it('should return 0 at the start of the timeline month', () => {
        expect(calculatePixelOffset('month', JAN_1, JAN_1)).toBe(0);
      });

      it('should return a day offset within the same month', () => {
        const jan15 = new Date('2024-01-15');
        // dayOfMonth = 15, offset = (15 - 1) * BASE_DAY_WIDTH
        const expected = 14 * BASE_DAY_WIDTH;
        expect(calculatePixelOffset('month', JAN_1, jan15)).toBeCloseTo(expected);
      });

      it('should equal one full January column width at Feb 1', () => {
        const feb1 = new Date('2024-02-01');
        const janWidth = calculateMonthWidth(JAN_1); // 31 * BASE_DAY_WIDTH
        expect(calculatePixelOffset('month', JAN_1, feb1)).toBeCloseTo(janWidth);
      });

      it('should accumulate widths across months', () => {
        const mar1 = new Date('2024-03-01');
        const janWidth = calculateMonthWidth(new Date('2024-01-01'));
        const febWidth = calculateMonthWidth(new Date('2024-02-01'));
        expect(calculatePixelOffset('month', JAN_1, mar1)).toBeCloseTo(janWidth + febWidth);
      });
    });
  });

  describe('pixelToDate', () => {
    describe('week view', () => {
      it('should return timeline start at pixel 0', () => {
        const result = pixelToDate('week', JAN_8, 0);
        expect(result.getTime()).toBe(JAN_8.getTime());
      });

      it('should return one week later at pixel WEEK_WIDTH', () => {
        const result = pixelToDate('week', JAN_8, WEEK_WIDTH);
        expect(result.getDate()).toBe(15); // Jan 15
      });

      it('should round down for partial weeks', () => {
        const result = pixelToDate('week', JAN_8, WEEK_WIDTH + 10);
        expect(result.getDate()).toBe(15); // still Jan 15
      });
    });

    describe('month view', () => {
      it('should return the 1st of the month at pixel 0', () => {
        const result = pixelToDate('month', JAN_1, 0);
        expect(result.getDate()).toBe(1);
        expect(result.getMonth()).toBe(0);
      });

      it('should move to February when pixel exceeds January width', () => {
        const janWidth = calculateMonthWidth(JAN_1); // 31 days
        const result = pixelToDate('month', JAN_1, janWidth + 1);
        expect(result.getMonth()).toBe(1); // February
      });

      it('should round-trip with calculatePixelOffset', () => {
        const original = new Date('2024-02-15');
        const pixel = calculatePixelOffset('month', JAN_1, original);
        const recovered = pixelToDate('month', JAN_1, pixel);
        // Should land on Feb 15 (day index from pixel within Feb)
        expect(recovered.getMonth()).toBe(1); // February
        expect(recovered.getDate()).toBe(15);
      });
    });
  });
});
