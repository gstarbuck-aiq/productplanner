import React from 'react';
import { useTimelineScroll } from '../../hooks/useTimelineScroll';
import { formatWeekRange } from '../../utils/weekHelpers';
import './Header.css';

interface HeaderProps {
  onAddTask: () => void;
}

export function Header({ onAddTask }: HeaderProps) {
  const { visibleWeeks, scrollToToday, scrollNext, scrollPrevious } =
    useTimelineScroll();

  const firstWeek = visibleWeeks[0];
  const lastWeek = visibleWeeks[visibleWeeks.length - 1];

  const dateRange = firstWeek && lastWeek
    ? formatWeekRange(firstWeek, lastWeek)
    : '';

  return (
    <>
      <header className="header">
        <div className="header-left">
          <h1 className="app-title">Product Planner</h1>
          <div className="date-range">{dateRange}</div>
        </div>

        <div className="header-center">
          <div className="nav-buttons">
            <button
              onClick={scrollPrevious}
              className="nav-button"
              aria-label="Previous weeks"
              title="Previous weeks"
            >
              &#8592; Previous
            </button>
            <button
              onClick={scrollToToday}
              className="nav-button today-button"
              aria-label="Go to today"
              title="Go to current week"
            >
              Today
            </button>
            <button
              onClick={scrollNext}
              className="nav-button"
              aria-label="Next weeks"
              title="Next weeks"
            >
              Next &#8594;
            </button>
          </div>
        </div>

        <div className="header-right">
          <button
            onClick={onAddTask}
            className="add-task-button"
            aria-label="Add new task"
          >
            + Add Task
          </button>
        </div>
      </header>
    </>
  );
}
