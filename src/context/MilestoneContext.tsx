import { createContext, useContext, ReactNode, useCallback } from 'react';
import type { Milestone, MilestoneInput, MilestoneJSON } from '../types/milestone';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getWeekStart } from '../utils/weekHelpers';

interface MilestoneContextValue {
  milestones: Milestone[];
  addMilestone: (milestone: MilestoneInput) => void;
  updateMilestone: (id: string, label: string) => void;
  deleteMilestone: (id: string) => void;
  getMilestoneForDate: (date: Date) => Milestone | undefined;
}

const MilestoneContext = createContext<MilestoneContextValue | undefined>(undefined);

const STORAGE_KEY = 'taskplanner_milestones';

function serializeMilestone(milestone: Milestone): MilestoneJSON {
  return {
    ...milestone,
    date: milestone.date.toISOString(),
    createdAt: milestone.createdAt.toISOString(),
    updatedAt: milestone.updatedAt.toISOString(),
  };
}

function deserializeMilestone(json: MilestoneJSON): Milestone {
  return {
    ...json,
    date: new Date(json.date),
    createdAt: new Date(json.createdAt),
    updatedAt: new Date(json.updatedAt),
  };
}

export function MilestoneProvider({ children }: { children: ReactNode }) {
  const [storedMilestones, setStoredMilestones] = useLocalStorage<MilestoneJSON[]>(
    STORAGE_KEY,
    []
  );

  const milestones = storedMilestones.map(deserializeMilestone);

  const addMilestone = useCallback(
    (input: MilestoneInput) => {
      const now = new Date();
      const weekStart = getWeekStart(input.date);

      // Check if milestone already exists for this week
      const existingIndex = storedMilestones.findIndex((m) => {
        const mDate = new Date(m.date);
        return getWeekStart(mDate).getTime() === weekStart.getTime();
      });

      if (existingIndex >= 0) {
        // Update existing milestone
        const updated = [...storedMilestones];
        updated[existingIndex] = {
          ...updated[existingIndex],
          label: input.label,
          updatedAt: now.toISOString(),
        };
        setStoredMilestones(updated);
      } else {
        // Add new milestone
        const newMilestone: MilestoneJSON = {
          id: crypto?.randomUUID?.() || `milestone-${Date.now()}-${Math.random()}`,
          date: weekStart.toISOString(),
          label: input.label,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
        setStoredMilestones([...storedMilestones, newMilestone]);
      }
    },
    [storedMilestones, setStoredMilestones]
  );

  const updateMilestone = useCallback(
    (id: string, label: string) => {
      const updated = storedMilestones.map((m) =>
        m.id === id
          ? { ...m, label, updatedAt: new Date().toISOString() }
          : m
      );
      setStoredMilestones(updated);
    },
    [storedMilestones, setStoredMilestones]
  );

  const deleteMilestone = useCallback(
    (id: string) => {
      setStoredMilestones(storedMilestones.filter((m) => m.id !== id));
    },
    [storedMilestones, setStoredMilestones]
  );

  const getMilestoneForDate = useCallback(
    (date: Date): Milestone | undefined => {
      const weekStart = getWeekStart(date);
      return milestones.find((m) => {
        const mWeekStart = getWeekStart(m.date);
        return mWeekStart.getTime() === weekStart.getTime();
      });
    },
    [milestones]
  );

  const value: MilestoneContextValue = {
    milestones,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    getMilestoneForDate,
  };

  return (
    <MilestoneContext.Provider value={value}>
      {children}
    </MilestoneContext.Provider>
  );
}

export function useMilestones() {
  const context = useContext(MilestoneContext);
  if (context === undefined) {
    throw new Error('useMilestones must be used within a MilestoneProvider');
  }
  return context;
}
