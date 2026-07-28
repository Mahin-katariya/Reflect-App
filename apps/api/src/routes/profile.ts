import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ErrorCodes } from "../error.js";
import { requireAuth } from "../middlewares/requiredAuth.js";
import { buildPublicProfile } from "../lib/publicProfile.js";


export const profileRouter = Router();

// ! unprotected route (public access)

profileRouter.get('/profile/:slug', async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  // * Step-A -- find the profile with topics -> logs -> resources. We pull the
  // logs' resources + timestamps so we can build the per-topic deduped resource
  // list and the account-level streak/heatmap in one query.
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
          logs: {
            select: {
              id: true,
              title: true,
              created_at: true,
              resources: { select: { id: true, url: true, title: true } },
            },
            orderBy: { created_at: 'desc' }
          },
        },
        orderBy: { created_at: 'desc' }
      },
    },
  });

  // * Step-B -- if no profile found return error gracefully:

  if (!profile) return res.status(404).json({
    ok: false,
    error: { code: ErrorCodes.PROFILE_NOT_FOUND, message: 'User Profile Not Found' }
  });

  // * Step-C -- shape the response (deduped resources + streak/heatmap) and return:

  return res.status(200).json({
    ok: true,
    data: buildPublicProfile(profile, new Date())
  })
})

// ! protected route

profileRouter.get('/me', requireAuth ,async (req: Request, res: Response) => {

  const profile = await prisma.profile.findUnique({

    where: { id: req.userId},
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
          logs: {
            select: {
              id: true,
              title: true,
              notes: true,
              created_at: true,
              resources: {
                select: {id: true, url: true, title: true}
              },
            },
            orderBy: {created_at: 'desc'}
          },
        },
        orderBy: { created_at: 'desc' }
      },
    },
  });

  if (!profile) return res.status(404).json({
    ok: false,
    error: { code: ErrorCodes.PROFILE_NOT_FOUND, message: 'User Profile Not Found' }
  });

  return res.status(200).json({
    ok: true,
    data: profile
  })
})
