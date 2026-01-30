import { useState } from 'react';
import type { ViewMode } from '../../types/timeline';
import { isCurrentWeek } from '../../utils/weekHelpers';
import { isCurrentMonth } from '../../utils/monthHelpers';
import { getTimeUnitWidth, formatTimeUnitHeader } from '../../utils/timeHelpers';
import { useMilestones } from '../../context/MilestoneContext';
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

  const { getMilestoneForDate, addMilestone } = useMilestones();
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneLabel, setMilestoneLabel] = useState('');

  const milestone = getMilestoneForDate(date);
  const canAddMilestone = viewMode === 'week'; // Only allow adding in week view

  const handleHeaderClick = () => {
    if (!milestone && canAddMilestone) {
      setShowAddMilestone(true);
    }
  };

  const handleAddMilestone = () => {
    if (milestoneLabel.trim()) {
      addMilestone({ date, label: milestoneLabel.trim() });
      setMilestoneLabel('');
      setShowAddMilestone(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddMilestone();
    } else if (e.key === 'Escape') {
      setMilestoneLabel('');
      setShowAddMilestone(false);
    }
  };

  return (
    <div
      className={`time-column ${isCurrent ? 'current-period' : ''} ${milestone ? 'has-milestone' : ''}`}
      style={{ width }}
      data-time-index={index}
      data-time-start={date.toISOString()}
      data-view-mode={viewMode}
    >
      <div
        className="time-header"
        onClick={handleHeaderClick}
        title={milestone ? '' : canAddMilestone ? 'Click to add milestone' : ''}
      >
        {label}
        {!milestone && !showAddMilestone && canAddMilestone && (
          <span className="add-milestone-hint">+</span>
        )}
      </div>

      {showAddMilestone && !milestone && canAddMilestone && (
        <div className="milestone-add-form">
          <input
            type="text"
            value={milestoneLabel}
            onChange={(e) => setMilestoneLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!milestoneLabel.trim()) {
                setShowAddMilestone(false);
              }
            }}
            placeholder="Milestone name"
            className="milestone-add-input"
            autoFocus
          />
          <div className="milestone-add-actions">
            <button
              onClick={handleAddMilestone}
              className="milestone-add-btn"
              disabled={!milestoneLabel.trim()}
            >
              Add
            </button>
            <button
              onClick={() => {
                setMilestoneLabel('');
                setShowAddMilestone(false);
              }}
              className="milestone-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
