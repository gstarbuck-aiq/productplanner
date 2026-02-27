import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { TaskProvider, useTasks } from "./TaskContext";
import { STORAGE_KEY_TASKS } from "../constants";

describe("TaskContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should provide empty tasks initially", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.tasks).toEqual([]);
    });
  });

  it("should add a task", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    act(() => {
      result.current.addTask({
        title: "Test Task",
        startDate: new Date("2024-01-01"),
        durationWeeks: 2,
        color: "#3b82f6",
      });
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe("Test Task");
      expect(result.current.tasks[0].durationWeeks).toBe(2);
    });
  });

  it("should delete a task", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    let taskId: string;

    act(() => {
      taskId = result.current.addTask({
        title: "Test Task",
        startDate: new Date("2024-01-01"),
        durationWeeks: 2,
        color: "#3b82f6",
      });
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    act(() => {
      result.current.deleteTask(taskId);
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(0);
    });
  });

  it("should move a task", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    let taskId: string;
    const initialDate = new Date("2024-01-01");
    const newDate = new Date("2024-01-15");

    act(() => {
      taskId = result.current.addTask({
        title: "Test Task",
        startDate: initialDate,
        durationWeeks: 2,
        color: "#3b82f6",
      });
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    act(() => {
      result.current.moveTask(taskId, newDate);
    });

    await waitFor(() => {
      const task = result.current.getTaskById(taskId);
      expect(task?.startDate.toISOString()).toBe(newDate.toISOString());
      expect(task?.durationWeeks).toBe(2); // Duration should stay the same
    });
  });

  it("should resize a task", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    let taskId: string;
    const startDate = new Date("2024-01-01");

    act(() => {
      taskId = result.current.addTask({
        title: "Test Task",
        startDate,
        durationWeeks: 2,
        color: "#3b82f6",
      });
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    act(() => {
      result.current.resizeTask(taskId, startDate, 4);
    });

    await waitFor(() => {
      const task = result.current.getTaskById(taskId);
      expect(task?.durationWeeks).toBe(4);
    });
  });

  it("should update a task", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    let taskId: string;

    act(() => {
      taskId = result.current.addTask({
        title: "Test Task",
        startDate: new Date("2024-01-01"),
        durationWeeks: 2,
        color: "#3b82f6",
      });
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const task = result.current.getTaskById(taskId);
    expect(task).toBeDefined();

    act(() => {
      result.current.updateTask({
        ...task!,
        title: "Updated Task",
      });
    });

    await waitFor(() => {
      const updated = result.current.getTaskById(taskId);
      expect(updated?.title).toBe("Updated Task");
    });
  });

  it("should calculate stack positions for overlapping tasks", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    act(() => {
      result.current.addTask({
        title: "Task 1",
        startDate: new Date("2024-01-01"),
        durationWeeks: 2,
        color: "#3b82f6",
      });

      result.current.addTask({
        title: "Task 2",
        startDate: new Date("2024-01-08"),
        durationWeeks: 2,
        color: "#10b981",
      });
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(2);
      // Tasks should have different stack positions
      const positions = result.current.tasks.map((t) => t.stackPosition);
      expect(new Set(positions).size).toBeGreaterThan(1);
    });
  });

  it("should persist tasks to localStorage", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.addTask({
        title: "Persisted Task",
        startDate: new Date("2024-01-01"),
        durationWeeks: 1,
        color: "#3b82f6",
      });
    });

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    const stored = localStorage.getItem(STORAGE_KEY_TASKS);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe("Persisted Task");
  });

  it("should load persisted tasks from localStorage on mount", async () => {
    // Pre-populate localStorage with a serialised task
    const now = new Date("2024-01-01").toISOString();
    const storedTask = {
      id: "task-stored-1",
      title: "Stored Task",
      startDate: now,
      endDate: now,
      durationWeeks: 1,
      color: "#3b82f6",
      stackPosition: 0,
      createdAt: now,
      updatedAt: now,
    };
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify([storedTask]));

    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe("Stored Task");
    });
  });

  it("should return undefined from getTaskById for unknown id", async () => {
    const { result } = renderHook(() => useTasks(), {
      wrapper: TaskProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.getTaskById("nonexistent")).toBeUndefined();
  });
});
