"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskColumnDefinition, TaskStatus } from "../types/task";
import { TaskCard } from "./task-card";
import { TaskComposer } from "./task-composer";

interface TaskColumnProps {
  column: TaskColumnDefinition;
  tasks: Task[];
  onCreateTask: (status: TaskStatus, title: string) => void;
  isBusy?: boolean;
}

/** Column wrapper that hosts sortable task cards and an inline composer. */
export function TaskColumn({
  column,
  tasks,
  onCreateTask,
  isBusy,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { columnId: column.id },
  });

  return (
    <section
      ref={setNodeRef}
      className="flex h-full min-h-[520px] flex-col gap-3 rounded-3xl border border-zinc-200 bg-zinc-50/60 p-5 shadow-inner transition dark:border-zinc-700 dark:bg-zinc-900/40"
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {column.title}
          </h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${column.accentClassName}`}
          >
            {tasks.length}件
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {column.description}
        </p>
      </header>
      <div
        className={`flex flex-1 flex-col gap-3 rounded-2xl p-1 transition ${
          isOver ? "bg-zinc-200/60 dark:bg-zinc-800/40" : "bg-transparent"
        }`}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-6 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
              タスクはまだありません。
            </p>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} columnId={column.id} />
            ))
          )}
        </SortableContext>
      </div>
      <TaskComposer
        status={column.id}
        onCreate={onCreateTask}
        disabled={isBusy}
      />
    </section>
  );
}
