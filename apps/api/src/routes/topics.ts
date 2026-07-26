import { requireAuth } from "../middlewares/requiredAuth.js";
import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { CreateTopicInput } from "../schemas/topics.js";
import { ErrorCodes } from "../error.js";

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
