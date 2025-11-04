export type TaskStatus = "todo" | "inProgress" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  description?: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskColumnDefinition {
  id: TaskStatus;
  title: string;
  description: string;
  accentClassName: string;
}

export type TaskBoardState = Record<TaskStatus, Task[]>;
