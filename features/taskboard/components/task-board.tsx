"use client";

import type {
  DragCancelEvent,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { AuthPanel } from "@/features/auth/components/auth-panel";
import { TASK_COLUMNS } from "../constants/columns";
import { useIsClient } from "../hooks/use-is-client";
import { useTaskBoard } from "../hooks/use-task-board";
import type { Task, TaskStatus } from "../types/task";
import { TaskCardOverlay } from "./task-card";
import { TaskColumn } from "./task-column";

/** High-level board component that orchestrates columns and drag interactions. */
export function TaskBoard() {
  const isClient = useIsClient();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );
  const {
    state,
    counts,
    addTask,
    moveTask,
    isLoading,
    isUnauthorized,
    error,
    refresh,
  } = useTaskBoard();
  const taskLookup = useMemo(() => {
    const map = new Map<string, { task: Task; status: TaskStatus }>();
    for (const status of Object.keys(state) as TaskStatus[]) {
      state[status].forEach((task) => {
        map.set(task.id, { task, status });
      });
    }
    return map;
  }, [state]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  if (!isClient) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-8">
        <div className="h-8 w-40 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid gap-6 md:grid-cols-3">
          {TASK_COLUMNS.map((column) => (
            <div
              key={column.id}
              className="flex min-h-[320px] flex-col gap-4 rounded-3xl border border-dashed border-zinc-200 p-6 dark:border-zinc-700"
            >
              <div className="h-6 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex-1 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  function resolveColumnId(raw: unknown): TaskStatus | undefined {
    if (typeof raw !== "string") {
      return undefined;
    }

    if (raw.startsWith("column-")) {
      return raw.replace("column-", "") as TaskStatus;
    }

    return raw as TaskStatus;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const taskId = String(active.id);
    if (taskLookup.has(taskId)) {
      setActiveTaskId(taskId);
    }
  }

  function handleDragCancel(_event: DragCancelEvent) {
    setActiveTaskId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTaskId(null);

    const { active, over } = event;

    if (isLoading || isUnauthorized) {
      return;
    }

    if (!over || !active.data.current) {
      return;
    }

    const activeColumn = active.data.current.columnId as TaskStatus | undefined;
    if (!activeColumn) {
      return;
    }

    const overColumnFromData = over.data.current?.columnId as
      | TaskStatus
      | undefined;
    const destinationColumn =
      overColumnFromData ?? resolveColumnId(over.id) ?? activeColumn;

    const overTaskId =
      (over.data.current?.taskId as string | undefined) ?? undefined;

    const taskId = active.id as string;

    const isSameColumn = activeColumn === destinationColumn;
    const isSamePosition =
      isSameColumn && (!overTaskId || overTaskId === taskId);

    if (isSamePosition) {
      return;
    }

    void moveTask(taskId, activeColumn, destinationColumn, overTaskId);
  }

  return (
    <div className="flex w-full flex-col gap-10">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
              TaskBoard
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              未着手・進行中・完了をドラッグで整理する、Notion
              風のカンバンです。
            </p>
          </div>
          <dl className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-700 dark:text-emerald-300">
              未着手 {counts.todo}
            </div>
            <div className="rounded-full bg-amber-500/10 px-3 py-1 font-semibold text-amber-700 dark:text-amber-300">
              進行中 {counts.inProgress}
            </div>
            <div className="rounded-full bg-sky-500/10 px-3 py-1 font-semibold text-sky-700 dark:text-sky-300">
              完了 {counts.done}
            </div>
          </dl>
        </div>
        {error ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                void refresh();
              }}
              className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold transition hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/40"
            >
              再読み込み
            </button>
          </div>
        ) : null}
        <AuthPanel
          isUnauthorized={isUnauthorized}
          isLoading={isLoading}
          counts={counts}
          refresh={refresh}
        />
        {isLoading ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            タスクを読み込み中...
          </p>
        ) : null}
      </header>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-6 md:grid-cols-3">
          {TASK_COLUMNS.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              tasks={state[column.id]}
              onCreateTask={addTask}
              isBusy={isLoading || isUnauthorized}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTaskId
            ? (() => {
                const match = taskLookup.get(activeTaskId);
                if (!match) {
                  return null;
                }
                return (
                  <TaskCardOverlay task={match.task} columnId={match.status} />
                );
              })()
            : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
