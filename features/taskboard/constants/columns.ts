import type { TaskColumnDefinition } from "../types/task";

export const TASK_COLUMNS: TaskColumnDefinition[] = [
  {
    id: "todo",
    title: "未着手",
    description: "これから手を付けるアイテムを整理します。",
    accentClassName: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "inProgress",
    title: "進行中",
    description: "現在対応しているタスクを可視化します。",
    accentClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    id: "done",
    title: "完了",
    description: "完了済みのタスクを記録します。",
    accentClassName: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
];
