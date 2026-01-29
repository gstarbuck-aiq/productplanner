import React from 'react';
import { formatWeekHeader, isCurrentWeek } from '../../utils/weekHelpers';
import { WEEK_WIDTH } from '../../constants';
import './WeekColumn.css';

interface WeekColumnProps {
  weekStart: Date;
  index: number;
}

export function WeekColumn({ weekStart, index }: WeekColumnProps) {
  const isCurrent = isCurrentWeek(weekStart);

  return (
    <div
      className={`week-column ${isCurrent ? 'current-week' : ''}`}
      style={{ width: WEEK_WIDTH }}
      data-week-index={index}
      data-week-start={weekStart.toISOString()}
    >
      <div className="week-header">{formatWeekHeader(weekStart)}</div>
    </div>
  );
}
