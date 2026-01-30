import { useMemo } from 'react';
import type { Task } from '../types/task';
import { calculateStackPositions } from '../utils/taskPositioning';

/**
 * Custom hook that automatically calculates stack positions for tasks
 * Recalculates whenever tasks array changes
 */
export function useTaskStacking(tasks: Task[]): Task[] {
  return useMemo(() => {
    return calculateStackPositions(tasks);
  }, [tasks]);
}
