/**
 * Represents a week in the timeline
 */
export interface Week {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  isCurrentWeek: boolean;
}

/**
 * Timeline viewport configuration
 */
export interface TimelineViewport {
  startWeek: Date;
  endWeek: Date;
  visibleWeeks: number;
}

/**
 * Position data for a task in the timeline
 */
export interface TaskPosition {
  left: number;
  width: number;
  top: number;
  height: number;
}
