import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "@/utils/prisma/client";
import { createClient } from "@/utils/supabase/server";
import {
  publicTaskStatusSchema,
  sortTasksForResponse,
  toPrismaStatus,
  toPublicTask,
} from "./helpers";

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

const createTaskSchema = z.object({
  title: z.string().min(1).max(120),
  status: publicTaskStatusSchema.default("todo"),
  description: z.string().max(500).optional().nullable(),
});

app.onError((err, c) => {
  console.error("Unhandled task route error", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.get(async (c) => {
  const ownerId = c.get("userId");
  const tasks = await prisma.task.findMany({
    where: { ownerId },
    orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "asc" }],
  });

  return c.json({ data: sortTasksForResponse(tasks) });
});

app.post(zValidator("json", createTaskSchema), async (c) => {
  const body = c.req.valid("json");
  const ownerId = c.get("userId");

  const columnSize = await prisma.task.count({
    where: {
      ownerId,
      status: toPrismaStatus(body.status),
    },
  });

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      status: toPrismaStatus(body.status),
      ownerId,
      position: columnSize,
    },
  });

  return c.json({ data: toPublicTask(task) }, 201);
});

export const GET = (request: Request) => app.fetch(request);
export const POST = (request: Request) => app.fetch(request);
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
