"use client";

import { useState } from "react";
import type { TaskStatus } from "../types/task";

interface TaskComposerProps {
  status: TaskStatus;
  onCreate: (status: TaskStatus, title: string) => void;
  disabled?: boolean;
}

/** In-column inline form for adding a new task. */
export function TaskComposer({
  status,
  onCreate,
  disabled,
}: TaskComposerProps) {
  const [title, setTitle] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();

    if (!trimmed || disabled) {
      return;
    }

    onCreate(status, trimmed);
    setTitle("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-white/70 p-3 shadow-sm transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:border-zinc-500"
    >
      <label className="flex w-full flex-col gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-300">
        新しいタスク
        <textarea
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (title.trim().length > 0 && !disabled) {
                onCreate(status, title.trim());
                setTitle("");
              }
            }
          }}
          placeholder="タスク名を入力..."
          rows={2}
          disabled={disabled}
          className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/40 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
        />
      </label>
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={disabled || title.trim().length === 0}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500"
        >
          追加
        </button>
      </div>
    </form>
  );
}
