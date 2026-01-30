import { useState } from 'react';
import { format, differenceInDays, addYears } from 'date-fns';
import { useTimelineSettings } from '../../context/TimelineSettingsContext';
import './DateRangePicker.css';

const MIN_RANGE_DAYS = 7;
const MAX_RANGE_YEARS = 5;

export function DateRangePicker() {
  const { dateRangeStart, dateRangeEnd, setDateRange } = useTimelineSettings();

  const [startInput, setStartInput] = useState(format(dateRangeStart, 'yyyy-MM-dd'));
  const [endInput, setEndInput] = useState(format(dateRangeEnd, 'yyyy-MM-dd'));
  const [error, setError] = useState('');

  const validateAndUpdate = () => {
    const start = new Date(startInput);
    const end = new Date(endInput);

    // Check for invalid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Please enter valid dates');
      return;
    }

    // Check if end is after start
    if (end <= start) {
      setError('End date must be after start date');
      return;
    }

    // Check minimum range
    const daysDiff = differenceInDays(end, start);
    if (daysDiff < MIN_RANGE_DAYS) {
      setError(`Date range must be at least ${MIN_RANGE_DAYS} days`);
      return;
    }

    // Check maximum range
    const maxEnd = addYears(start, MAX_RANGE_YEARS);
    if (end > maxEnd) {
      setError(`Date range cannot exceed ${MAX_RANGE_YEARS} years`);
      return;
    }

    // All validations passed
    setError('');
    setDateRange(start, end);
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartInput(e.target.value);
    setError('');
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndInput(e.target.value);
    setError('');
  };

  const currentRangeDays = differenceInDays(dateRangeEnd, dateRangeStart);

  return (
    <div className="date-range-picker">
      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date">Start Date</label>
          <input
            type="date"
            id="start-date"
            value={startInput}
            onChange={handleStartChange}
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="end-date">End Date</label>
          <input
            type="date"
            id="end-date"
            value={endInput}
            onChange={handleEndChange}
          />
        </div>
        <button className="update-button" onClick={validateAndUpdate}>
          Update Range
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="current-range">
        Current range: {format(dateRangeStart, 'MMM d, yyyy')} - {format(dateRangeEnd, 'MMM d, yyyy')}
        {' '}({currentRangeDays} days)
      </div>
    </div>
  );
}
