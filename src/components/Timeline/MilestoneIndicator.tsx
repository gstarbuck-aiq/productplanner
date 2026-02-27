import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import type { Milestone } from "../../types/milestone";
import type { ViewMode } from "../../types/timeline";
import { useMilestones } from "../../context/MilestoneContext";
import { calculatePixelOffset } from "../../utils/timeHelpers";
import { ConfirmDialog } from "../ConfirmDialog/ConfirmDialog";
import "./MilestoneIndicator.css";

interface MilestoneIndicatorProps {
  milestone: Milestone;
  viewMode: ViewMode;
  timelineStartDate: Date;
}

export function MilestoneIndicator({
  milestone,
  viewMode,
  timelineStartDate,
}: MilestoneIndicatorProps) {
  const { updateMilestone, deleteMilestone } = useMilestones();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(milestone.label);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(milestone.label);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      updateMilestone(milestone.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(milestone.label);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleDeleteClick = () => {
    setIsConfirmingDelete(true);
  };

  const handleConfirmDelete = () => {
    deleteMilestone(milestone.id);
    setIsConfirmingDelete(false);
  };

  const handleCancelDelete = () => {
    setIsConfirmingDelete(false);
  };

  const dateLabel = format(milestone.date, "MMM d, yyyy");

  // Calculate position based on view mode
  const left = calculatePixelOffset(
    viewMode,
    timelineStartDate,
    milestone.date,
  );

  // In week view, allow text to flow naturally (no width constraint)
  // In month view, use fixed width
  const style: React.CSSProperties = {
    left: `${left}px`,
    ...(viewMode === "month" ? { width: "200px" } : { minWidth: "100px" }),
  };

  return (
    <>
      <div className="milestone-indicator" style={style}>
        <div className="milestone-icon" title="Milestone">
          ⬥
        </div>
        <div className="milestone-content">
          {isEditing ? (
            <div className="milestone-edit">
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="milestone-input"
                placeholder="Milestone name"
              />
            </div>
          ) : (
            <div className="milestone-display">
              <div className="milestone-label" onClick={handleEdit}>
                {milestone.label}
              </div>
              {viewMode === "month" && (
                <div className="milestone-date">{dateLabel}</div>
              )}
            </div>
          )}
          <div className="milestone-actions">
            {!isEditing && (
              <>
                <button
                  className="milestone-action-btn"
                  onClick={handleEdit}
                  title="Edit milestone"
                  aria-label="Edit milestone"
                >
                  ✎
                </button>
                <button
                  className="milestone-action-btn milestone-delete-btn"
                  onClick={handleDeleteClick}
                  title="Delete milestone"
                  aria-label="Delete milestone"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title="Delete Milestone"
        message={`Are you sure you want to delete "${milestone.label}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
