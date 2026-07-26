import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ErrorCodes } from "../error.js";


export const profileRouter = Router();

profileRouter.get('/profile/:slug', async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  // * Step-A -- find the profile by username, include their topics:
  const profile = await prisma.profile.findUnique({
    where: { username: slug },
    select: {
      id: true,
      username: true,
      timezone: true,
      createdAt: true,
      topics: {
        select: {
          id: true,
          title: true,
          description: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' }
      },
    },
  });

  console.log("========== profile data ===========");
  console.log(profile);
  console.log("=================================");

  // * Step-B -- if no profile found return error gracefully:

  if (!profile) return res.status(404).json({
    ok: false,
    error: { code: ErrorCodes.PROFILE_NOT_FOUND, message: 'User Profile Not Found' }
  });

  // * Step-C -- return response:

  return res.status(201).json({
    ok: true,
    data: profile
  })
})
