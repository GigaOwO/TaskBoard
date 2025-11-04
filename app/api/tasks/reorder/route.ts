import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "@/utils/prisma/client";
import { createClient } from "@/utils/supabase/server";
import {
  publicTaskStatusSchema,
  sortTasksForResponse,
  toPrismaStatus,
} from "../helpers";

const app = new Hono<{ Variables: { userId: string } }>();

app.use("*", async (c, next) => {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("userId", user.id);
  await next();
});

const reorderSchema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().min(1),
        status: publicTaskStatusSchema,
        position: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

app.onError((err, c) => {
  console.error("Unhandled reorder route error", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.patch(zValidator("json", reorderSchema), async (c) => {
  const { updates } = c.req.valid("json");
  const ownerId = c.get("userId");

  const taskIds = updates.map((update) => update.id);
  const existingTasks = await prisma.task.findMany({
    where: {
      ownerId,
      id: { in: taskIds },
    },
    select: { id: true },
  });

  if (existingTasks.length !== updates.length) {
    return c.json({ error: "Some tasks could not be found." }, 404);
  }

  await prisma.$transaction(
    updates.map((update) =>
      prisma.task.updateMany({
        where: { id: update.id, ownerId },
        data: {
          status: toPrismaStatus(update.status),
          position: update.position,
        },
      }),
    ),
  );

  const tasks = await prisma.task.findMany({
    where: { ownerId },
    orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "asc" }],
  });

  return c.json({ data: sortTasksForResponse(tasks) });
});

export const PATCH = (request: Request) => app.fetch(request);
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
