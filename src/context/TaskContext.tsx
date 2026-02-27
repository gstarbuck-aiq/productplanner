import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type { Task, TaskInput, TaskJSON } from "../types/task";
import { STORAGE_KEY_TASKS } from "../constants";
import { calculateEndDate } from "../utils/weekHelpers";
import { useTaskStacking } from "../hooks/useTaskStacking";
import { generateId } from "../utils/generateId";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
}

type TaskAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "SET_LOADING"; payload: boolean };

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  addTask: (input: TaskInput) => string;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStartDate: Date) => void;
  resizeTask: (id: string, newStartDate: Date, newDuration: number) => void;
  getTaskById: (id: string) => Task | undefined;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

/**
 * Serialize tasks for localStorage
 */
function serializeTasks(tasks: Task[]): string {
  const json: TaskJSON[] = tasks.map((task) => ({
    ...task,
    startDate: task.startDate.toISOString(),
    endDate: task.endDate.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }));
  return JSON.stringify(json);
}

/**
 * Deserialize tasks from localStorage
 */
function deserializeTasks(json: string): Task[] {
  try {
    const parsed: TaskJSON[] = JSON.parse(json);
    return parsed.map((task) => ({
      ...task,
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate),
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));
  } catch (error) {
    console.error("Error deserializing tasks:", error);
    return [];
  }
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    isLoading: true,
  });

  // Apply stacking to tasks
  const stackedTasks = useTaskStacking(state.tasks);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TASKS);
      if (stored) {
        const tasks = deserializeTasks(stored);
        dispatch({ type: "SET_TASKS", payload: tasks });
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!state.isLoading && stackedTasks.length >= 0) {
      try {
        localStorage.setItem(STORAGE_KEY_TASKS, serializeTasks(stackedTasks));
      } catch (error) {
        console.error("Error saving tasks:", error);
      }
    }
  }, [stackedTasks, state.isLoading]);

  const addTask = useCallback((input: TaskInput): string => {
    const now = new Date();
    const task: Task = {
      id: generateId("task"),
      title: input.title,
      startDate: input.startDate,
      endDate: calculateEndDate(input.startDate, input.durationWeeks),
      durationWeeks: input.durationWeeks,
      color: input.color,
      stackPosition: 0,
      createdAt: now,
      updatedAt: now,
    };

    dispatch({ type: "ADD_TASK", payload: task });
    return task.id;
  }, []);

  const updateTask = useCallback((task: Task) => {
    const updated = {
      ...task,
      updatedAt: new Date(),
    };
    dispatch({ type: "UPDATE_TASK", payload: updated });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: "DELETE_TASK", payload: id });
  }, []);

  const moveTask = useCallback(
    (id: string, newStartDate: Date) => {
      const task = stackedTasks.find((t) => t.id === id);
      if (!task) return;

      const updated: Task = {
        ...task,
        startDate: newStartDate,
        endDate: calculateEndDate(newStartDate, task.durationWeeks),
        updatedAt: new Date(),
      };

      dispatch({ type: "UPDATE_TASK", payload: updated });
    },
    [stackedTasks],
  );

  const resizeTask = useCallback(
    (id: string, newStartDate: Date, newDuration: number) => {
      const task = stackedTasks.find((t) => t.id === id);
      if (!task) return;

      const updated: Task = {
        ...task,
        startDate: newStartDate,
        endDate: calculateEndDate(newStartDate, newDuration),
        durationWeeks: newDuration,
        updatedAt: new Date(),
      };

      dispatch({ type: "UPDATE_TASK", payload: updated });
    },
    [stackedTasks],
  );

  const getTaskById = useCallback(
    (id: string) => {
      return stackedTasks.find((t) => t.id === id);
    },
    [stackedTasks],
  );

  const value: TaskContextType = {
    tasks: stackedTasks,
    isLoading: state.isLoading,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    resizeTask,
    getTaskById,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextType {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
