import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ErrorCodes } from "../error.js";
import { requireAuth } from "../middlewares/requiredAuth.js";
import { UpdateLogInput } from "../schemas/logs.js";
import type { ResourceInput } from "../schemas/logs.js";
export const logsRouter = Router();

// TODO: public facing view of logs
logsRouter.get("/logs/:logId", async (req: Request, res: Response) => {

  const logId = req.params.logId as string;

  const log = await prisma.log.findUnique({
    where: {
      id: logId
    },
    include: { resources: true }
  });

  if (!log) return res.status(404).json({
    ok: false,
    error: { code: ErrorCodes.LOG_NOT_FOUND, message: "Logs not found" }
  });

  return res.status(200).json({
    ok: true,
    data: log
  });
});

// TODO: private facing access of logs where the creator can modify content of his logs
logsRouter.patch('/logs/:logId', requireAuth, async (req: Request, res: Response) => {
  const logId = req.params.logId as string;

  // * validate the input by checking if it belongs to the right user
  const parsed = UpdateLogInput.safeParse(req.body);

  if (!parsed.success) return res.status(400).json({
    ok: false,
    error: { code: ErrorCodes.VALIDATION_ERROR, message: "Invalid Log Inputs" }
  });

  // * load the log and its topic in one queury
  const existing = await prisma.log.findUnique({
    where: { id: logId },
    include: { topic: true }
  });

  if (!existing) return res.status(404).json({
    ok: false,
    error: { code: ErrorCodes.LOG_NOT_FOUND, message: "Log not found" }
  });

  if (existing.topic.profileId !== req.userId) return res.status(403).json({
    ok: false,
    error: { code: ErrorCodes.FORBIDDEN, message: "You can only edit your logs" }
  });


  // TODO: update only what was changed without touching the timestamp (to prevent backtracking of streak calculations, and prevent leaks)
  const { title, notes, resources } = parsed.data;

  const log = await prisma.log.update({
    where: { id: logId },
    data: {
      ...(title !== undefined && { title }),
      ...(notes !== undefined && { notes }),
      ...(resources !== undefined && {
        resources: {
          deleteMany: {},
          create: resources.map(r => ({
            url: r.url,
            title: r.title ?? r.url
          })),
        }
      }),
    },
    include: { resources: true }
  });

  if (!log) return res.status(500).json({
    ok: false,
    error: { code: ErrorCodes.INTERNAL_SERVER_ERROR, message: "Something went wrong. Please try again" }
  });

  return res.status(200).json({
    ok: true,
    data: log
  });
})
