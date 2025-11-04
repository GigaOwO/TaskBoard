import type {
  Task as PrismaTask,
  TaskStatus as PrismaTaskStatus,
} from "@prisma/client";
import { TaskStatus as PrismaStatus } from "@prisma/client";
import { z } from "zod";

export const publicTaskStatusSchema = z.enum(["todo", "inProgress", "done"]);

export type PublicTaskStatus = z.infer<typeof publicTaskStatusSchema>;

const statusToPrisma: Record<PublicTaskStatus, PrismaTaskStatus> = {
  todo: PrismaStatus.TODO,
  inProgress: PrismaStatus.IN_PROGRESS,
  done: PrismaStatus.DONE,
};

const statusFromPrisma: Record<PrismaTaskStatus, PublicTaskStatus> = {
  [PrismaStatus.TODO]: "todo",
  [PrismaStatus.IN_PROGRESS]: "inProgress",
  [PrismaStatus.DONE]: "done",
};

export const taskResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: publicTaskStatusSchema,
  position: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PublicTask = z.infer<typeof taskResponseSchema>;

export function toPrismaStatus(status: PublicTaskStatus): PrismaTaskStatus {
  return statusToPrisma[status];
}

export function toPublicStatus(status: PrismaTaskStatus): PublicTaskStatus {
  return statusFromPrisma[status];
}

export function toPublicTask(task: PrismaTask): PublicTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    status: toPublicStatus(task.status),
    position: task.position,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export function sortTasksForResponse(tasks: PrismaTask[]): PublicTask[] {
  const statusRank: Record<PrismaTaskStatus, number> = {
    [PrismaStatus.TODO]: 0,
    [PrismaStatus.IN_PROGRESS]: 1,
    [PrismaStatus.DONE]: 2,
  };

  return tasks
    .sort((left, right) => {
      if (left.status === right.status) {
        if (left.position === right.position) {
          return left.createdAt.getTime() - right.createdAt.getTime();
        }

        return left.position - right.position;
      }

      return statusRank[left.status] - statusRank[right.status];
    })
    .map((task) => toPublicTask(task));
}
