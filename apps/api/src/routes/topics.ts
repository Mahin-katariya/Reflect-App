import { requireAuth } from "../middlewares/requiredAuth.js";
import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { CreateTopicInput, UpdateTopicInput } from "../schemas/topics.js";
import { CreateLogInput } from "../schemas/logs.js";
import { ErrorCodes } from "../error.js";
import type { ResourceInput } from "../schemas/logs.js";
export const topicsRouter = Router();

topicsRouter.post('/topics', requireAuth, async (req: Request, res: Response) => {

  // * Step-1 validate the body
  const parsed = CreateTopicInput.safeParse(req.body);

  if (!parsed.success) return res.status(400).json({
    ok: false,
    error: { code: ErrorCodes.VALIDATION_ERROR, message: 'Invalid Topic Input' }
  });

  console.log("========== parsed data ===========");
  console.log(parsed);
  console.log("=================================");

  const { title, description } = parsed.data;

  // * Step-2 create the topic, and link it to the authenticated user

  const topic = await prisma.topic.create({
    data: {
      title,
      description: description ?? null,
      profileId: req.userId,
    }
  });

  if (!topic) return res.status(500).json({
    ok: false,
    error: { code: ErrorCodes.INTERNAL_SERVER_ERROR, message: "Failed to create a topic" }
  });

  return res.status(201).json({
    ok: true,
    data: topic
  })
})

topicsRouter.patch('/topics/:topicId', requireAuth, async (req: Request, res: Response) => {
  const topicId = req.params.topicId as string;

  // * Step-1 validate the body
  const parsed = UpdateTopicInput.safeParse(req.body);

  if (!parsed.success) return res.status(400).json({
    ok: false,
    error: { code: ErrorCodes.VALIDATION_ERROR, message: 'Invalid Topic Input' }
  });

  // * Step-2 load the topic + check ownership
  const existing = await prisma.topic.findUnique({ where: { id: topicId } });

  if (!existing) return res.status(404).json({
    ok: false,
    error: { code: ErrorCodes.TOPIC_NOT_FOUND, message: 'Topic not found!' }
  });

  if (existing.profileId !== req.userId) return res.status(403).json({
    ok: false,
    error: { code: ErrorCodes.FORBIDDEN, message: 'Not your topic' }
  });

  // * Step-3 update only the fields that were sent (omitted = untouched)
  const { description } = parsed.data;

  const topic = await prisma.topic.update({
    where: { id: topicId },
    data: { ...(description !== undefined && { description }) },
  });

  return res.status(200).json({
    ok: true,
    data: topic
  });
})

topicsRouter.post('/topics/:topicId/logs', requireAuth, async (req: Request, res: Response) => {

  const topicId = req.params.topicId as string;

  const parsed = CreateLogInput.safeParse(req.body);

  console.log("========== parsed data ===========");
  console.log(parsed);
  console.log("==================================");

  if (!parsed.success) return res.status(400).json({
    ok: false,
    error: { code: ErrorCodes.VALIDATION_ERROR, message: 'Invalid Log Input' }
  });

  const topic = await prisma.topic.findUnique({
    where: {id: topicId}
  })

  if (!topic) return res.status(404).json({
    ok: false,
    error: { code: ErrorCodes.TOPIC_NOT_FOUND, message: 'Topic not found!' }
  });

  // ! A check for if the topic exists, but the user that it belongs to doesn't

  if (topic && topic.profileId !== req.userId) {
    return res.status(403).json({
      ok: false,
      error: { code: ErrorCodes.FORBIDDEN, message: "Not your topic" }
    });
  };

  // TODO: building the resources row, if title is skipped -> fallback to url with slicing of url to shorten and neaten the
  const { title, notes, resources } = parsed.data;

  const resourceRows = resources.map((row: ResourceInput) => {
    return {
      url: row.url,
      title: row.title ?? row.url
    }
  });

  // TODO: create the Log and its nested Resource in a single call
  const log = await prisma.log.create({
    data: {
      title,
      notes,
      topicId,
      resources: { create: resourceRows },
    },
    include: {resources: true}
  });

  if (!log) return res.status(500).json({
    ok: false,
    error: { code: ErrorCodes.INTERNAL_SERVER_ERROR, message: 'Something went wrong. Please try again' }
  });

  return res.status(201).json({
    ok: true,
    data: log
  })

})
