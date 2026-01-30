/**
 * Represents a milestone marking a specific week
 */
export interface Milestone {
  id: string;
  date: Date; // Monday of the milestone week
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Milestone data for creation (without auto-calculated fields)
 */
export interface MilestoneInput {
  date: Date;
  label: string;
}

/**
 * Milestone data for persistence (dates as strings)
 */
export interface MilestoneJSON {
  id: string;
  date: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}
