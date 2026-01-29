/**
 * Represents a task that can span multiple weeks
 */
export interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  durationWeeks: number;
  color: string;
  stackPosition: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task data without auto-calculated fields (for creation)
 */
export interface TaskInput {
  title: string;
  startDate: Date;
  durationWeeks: number;
  color: string;
}

/**
 * Task data for persistence (dates as strings)
 */
export interface TaskJSON {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  color: string;
  stackPosition: number;
  createdAt: string;
  updatedAt: string;
}
