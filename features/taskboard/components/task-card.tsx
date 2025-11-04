"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskStatus } from "../types/task";

interface TaskCardContentProps {
  task: Task;
  columnId: TaskStatus;
}

function TaskCardContent({ task, columnId }: TaskCardContentProps) {
  return (
    <>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {task.title}
      </p>
      {task.description ? (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {task.description}
        </p>
      ) : null}
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
        <span>
          作成: {new Date(task.createdAt).toLocaleDateString("ja-JP")}
        </span>
        <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
          {columnId === "todo"
            ? "未着手"
            : columnId === "inProgress"
              ? "進行中"
              : "完了"}
        </span>
      </div>
    </>
  );
}

interface TaskCardProps extends TaskCardContentProps {}

/** Draggable task card rendered inside a column. */
export function TaskCard({ task, columnId }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { columnId, taskId: task.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : undefined,
    boxShadow: isDragging ? "0 15px 35px rgba(0,0,0,0.18)" : undefined,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="group relative rounded-xl border border-zinc-200 bg-white/90 p-4 text-left shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-md hover:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900/80 dark:hover:ring-zinc-700"
      {...attributes}
      {...listeners}
    >
      <TaskCardContent task={task} columnId={columnId} />
    </article>
  );
}

interface TaskCardOverlayProps extends TaskCardContentProps {}

/** Visual clone used inside the drag overlay to improve UX. */
export function TaskCardOverlay({ task, columnId }: TaskCardOverlayProps) {
  return (
    <article
      className="group relative rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-xl ring-1 ring-zinc-200 transition dark:border-zinc-700 dark:bg-zinc-900 dark:ring-zinc-700"
      style={{
        cursor: "grabbing",
        transform: "scale(1.03)",
      }}
    >
      <TaskCardContent task={task} columnId={columnId} />
    </article>
  );
}
