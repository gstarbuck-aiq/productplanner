import type { ViewMode } from '../../types/timeline';
import { isCurrentWeek } from '../../utils/weekHelpers';
import { isCurrentMonth } from '../../utils/monthHelpers';
import { getTimeUnitWidth, formatTimeUnitHeader } from '../../utils/timeHelpers';
import './TimeColumn.css';

interface TimeColumnProps {
  viewMode: ViewMode;
  date: Date;
  index: number;
}

export function TimeColumn({ viewMode, date, index }: TimeColumnProps) {
  const width = getTimeUnitWidth(viewMode, date);
  const label = formatTimeUnitHeader(viewMode, date);
  const isCurrent = viewMode === 'week' ? isCurrentWeek(date) : isCurrentMonth(date);

  return (
    <div
      className={`time-column ${isCurrent ? 'current-period' : ''}`}
      style={{ width }}
      data-time-index={index}
      data-time-start={date.toISOString()}
      data-view-mode={viewMode}
    >
      <div className="time-header">{label}</div>
    </div>
  );
}
