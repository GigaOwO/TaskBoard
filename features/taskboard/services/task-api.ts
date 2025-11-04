import type { Task, TaskStatus } from "../types/task";

const BASE_URL = "/api/tasks";

export class ApiError extends Error {
  status: number;
  body?: string;

  constructor(message: string, status: number, body?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<TResponse>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const rawText = await response.text();
    const message = rawText || response.statusText || "Unexpected API error";

    throw new ApiError(message, response.status, rawText);
  }

  return (await response.json()) as TResponse;
}

interface TaskListResponse {
  data: Task[];
}

interface CreateTaskBody {
  title: string;
  status: TaskStatus;
  description?: string | null;
}

interface CreateTaskResponse {
  data: Task;
}

export interface TaskReorderUpdate {
  id: string;
  status: TaskStatus;
  position: number;
}

interface ReorderTasksResponse {
  data: Task[];
}

export async function fetchTasks(): Promise<Task[]> {
  const { data } = await request<TaskListResponse>(BASE_URL, {
    method: "GET",
    cache: "no-store",
  });

  return data;
}

export async function createTask(payload: CreateTaskBody): Promise<Task> {
  const { data } = await request<CreateTaskResponse>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return data;
}

export async function reorderTasks(
  updates: TaskReorderUpdate[],
): Promise<Task[]> {
  const { data } = await request<ReorderTasksResponse>(`${BASE_URL}/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ updates }),
  });

  return data;
}
