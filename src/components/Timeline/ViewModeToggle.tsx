import { useTimelineSettings } from '../../context/TimelineSettingsContext';
import type { ViewMode } from '../../types/timeline';
import './ViewModeToggle.css';

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useTimelineSettings();

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <div className="view-mode-toggle">
      <button
        className={`toggle-button ${viewMode === 'week' ? 'active' : ''}`}
        onClick={() => handleModeChange('week')}
        aria-pressed={viewMode === 'week'}
      >
        Weeks
      </button>
      <button
        className={`toggle-button ${viewMode === 'month' ? 'active' : ''}`}
        onClick={() => handleModeChange('month')}
        aria-pressed={viewMode === 'month'}
      >
        Months
      </button>
    </div>
  );
}
