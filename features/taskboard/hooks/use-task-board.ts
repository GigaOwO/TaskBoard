"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createInitialTaskState } from "../constants/initial-tasks";
import {
  ApiError,
  createTask,
  fetchTasks,
  reorderTasks,
  type TaskReorderUpdate,
} from "../services/task-api";
import type { Task, TaskBoardState, TaskStatus } from "../types/task";

function createEmptyState(): TaskBoardState {
  return {
    todo: [],
    inProgress: [],
    done: [],
  };
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => left.position - right.position);
}

function toBoardState(tasks: Task[]): TaskBoardState {
  const base: TaskBoardState = {
    ...createEmptyState(),
  };

  tasks.forEach((task) => {
    base[task.status] = sortTasks([...base[task.status], task]);
  });

  return base;
}

interface ReorderResult {
  nextState: TaskBoardState;
  updates: TaskReorderUpdate[];
}

function reorderBoardState(
  state: TaskBoardState,
  taskId: string,
  from: TaskStatus,
  to: TaskStatus,
  targetTaskId?: string,
): ReorderResult {
  const sourceColumn = [...state[from]];
  const taskIndex = sourceColumn.findIndex((task) => task.id === taskId);

  if (taskIndex < 0) {
    return { nextState: state, updates: [] };
  }

  const [task] = sourceColumn.splice(taskIndex, 1);
  const destinationColumn = from === to ? sourceColumn : [...state[to]];

  let insertionIndex = destinationColumn.length;
  if (targetTaskId) {
    const candidateIndex = destinationColumn.findIndex(
      (candidate) => candidate.id === targetTaskId,
    );

    if (candidateIndex >= 0) {
      insertionIndex = candidateIndex;
    }
  }

  destinationColumn.splice(insertionIndex, 0, {
    ...task,
    status: to,
  });

  const updates = new Map<string, TaskReorderUpdate>();

  const recalculatedDestination = destinationColumn.map((item, index) => {
    const next: Task = {
      ...item,
      status: to,
      position: index,
    };

    updates.set(item.id, {
      id: item.id,
      status: to,
      position: index,
    });

    return next;
  });

  const nextState: TaskBoardState = {
    ...state,
    [to]: recalculatedDestination,
  };

  if (from !== to) {
    const recalculatedSource = sourceColumn.map((item, index) => {
      const next: Task = {
        ...item,
        position: index,
      };

      updates.set(item.id, {
        id: item.id,
        status: from,
        position: index,
      });

      return next;
    });

    nextState[from] = recalculatedSource;
  }

  return {
    nextState,
    updates: Array.from(updates.values()),
  };
}

/** Task board hook with Supabase persistence via Hono API routes. */
export function useTaskBoard() {
  const [state, setState] = useState<TaskBoardState>(createInitialTaskState());
  const [isHydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setUnauthorized] = useState(false);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadTasks = useCallback(async () => {
    setHydrated(false);
    try {
      const tasks = await fetchTasks();
      if (tasks.length === 0) {
        setState(createEmptyState());
        setUnauthorized(false);
        return;
      }

      setState(toBoardState(tasks));
      setError(null);
      setUnauthorized(false);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        setUnauthorized(true);
        setState(createEmptyState());
        setError(null);
        return;
      }

      console.error("Failed to load tasks", cause);
      setError("タスクの取得に失敗しました。");
      setState(createInitialTaskState());
      setUnauthorized(false);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const counts = useMemo(
    () => ({
      todo: state.todo.length,
      inProgress: state.inProgress.length,
      done: state.done.length,
    }),
    [state],
  );

  const addTask = useCallback(
    async (status: TaskStatus, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) {
        return;
      }

      if (isUnauthorized) {
        setError("ログインするとタスクを追加できます。");
        return;
      }

      try {
        const task = await createTask({
          status,
          title: trimmed,
        });

        setState((previous) => ({
          ...previous,
          [status]: sortTasks([...previous[status], task]),
        }));
        setError(null);
        setUnauthorized(false);
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) {
          setUnauthorized(true);
          setError("ログインするとタスクを追加できます。");
          return;
        }

        console.error("Failed to create task", cause);
        setError("タスクの作成に失敗しました。");
      }
    },
    [isUnauthorized],
  );

  const moveTask = useCallback(
    async (
      taskId: string,
      from: TaskStatus,
      to: TaskStatus,
      targetTaskId?: string,
    ) => {
      if (isUnauthorized) {
        setError("ログインすると並び替えを保存できます。");
        return;
      }

      const currentState = stateRef.current;
      const { nextState, updates } = reorderBoardState(
        currentState,
        taskId,
        from,
        to,
        targetTaskId,
      );

      if (updates.length === 0) {
        return;
      }

      setState(nextState);

      try {
        await reorderTasks(updates);
        setError(null);
        setUnauthorized(false);
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) {
          setUnauthorized(true);
          setState(currentState);
          setError("ログインすると並び替えを保存できます。");
        }

        console.error("Failed to reorder tasks", cause);
        setState(currentState);
        setError("タスクの並び替えに失敗しました。");
      } finally {
        // no-op; optimistic state already applied. Errors revert above.
      }
    },
    [isUnauthorized],
  );

  return {
    state,
    counts,
    addTask,
    moveTask,
    isLoading: !isHydrated,
    error,
    isUnauthorized,
    refresh: loadTasks,
  };
}
