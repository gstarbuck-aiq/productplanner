import { useTimelineScroll } from '../../hooks/useTimelineScroll';
import { format } from 'date-fns';
import { DateRangePicker } from '../Timeline/DateRangePicker';
import { ViewModeToggle } from '../Timeline/ViewModeToggle';
import './Header.css';

interface HeaderProps {
  onAddTask: () => void;
  onExportTimeline: () => void;
}

export function Header({ onAddTask, onExportTimeline }: HeaderProps) {
  const { visibleTimeUnits, scrollToToday, scrollNext, scrollPrevious } =
    useTimelineScroll();

  const firstDate = visibleTimeUnits[0];
  const lastDate = visibleTimeUnits[visibleTimeUnits.length - 1];

  const dateRangeDisplay = firstDate && lastDate
    ? `${format(firstDate, 'MMM d, yyyy')} - ${format(lastDate, 'MMM d, yyyy')}`
    : '';

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div className="app-branding">
            <h1 className="app-title">Product Planner</h1>
            <div className="build-info">
              Built {format(new Date(__BUILD_TIME__), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
          <div className="date-range">{dateRangeDisplay}</div>
        </div>

        <div className="header-center">
          <div className="nav-buttons">
            <button
              onClick={scrollPrevious}
              className="nav-button"
              aria-label="Previous"
              title="Go to previous period"
            >
              &#8592; Previous
            </button>
            <button
              onClick={scrollToToday}
              className="nav-button today-button"
              aria-label="Go to today"
              title="Center on today"
            >
              Today
            </button>
            <button
              onClick={scrollNext}
              className="nav-button"
              aria-label="Next"
              title="Go to next period"
            >
              Next &#8594;
            </button>
          </div>
        </div>

        <div className="header-right">
          <button
            onClick={onExportTimeline}
            className="export-button"
            aria-label="Export timeline"
            title="Export timeline (Print/PDF or Screenshot)"
          >
            ⤓ Export
          </button>
          <button
            onClick={onAddTask}
            className="add-task-button"
            aria-label="Add new task"
          >
            + Add Task
          </button>
        </div>
      </header>
      <div className="header-controls">
        <div className="header-controls-left">
          <ViewModeToggle />
        </div>
        <div className="header-controls-right">
          <DateRangePicker />
        </div>
      </div>
    </>
  );
}
