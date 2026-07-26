import { Router } from "express";
import type { Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase.js";
import { prisma } from "../lib/prisma.js";
import { RegisterInput } from "../schemas/register.js";
import { ErrorCodes } from "../error.js";


export const registerRouter = Router();

registerRouter.post('/register', async (req: Request, res: Response) => {

  // * Step-1 validate the incoming data:

  const parsed = RegisterInput.safeParse(req.body);
  console.log("========== parsed data ===========");
  console.log(parsed);
  console.log("=================================");

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: { code: ErrorCodes.VALIDATION_ERROR, message: 'Invalid Registration Input' }
    });
  }
  const { email, password, username, timezone } = parsed.data;

  // * Step-2 check if the username exists or not:

  const usernameExists = await prisma.profile.findUnique({ where: { username } });
  console.log("========== username data ===========");
  console.log(usernameExists);
  console.log("=================================");

  if (usernameExists) return res.status(409).json({
    ok: false,
    error: { code: ErrorCodes.USERNAME_TAKEN, message: "Username Exists" }
  });

  // * Step-3 Create the Auth user using supabaseAdmin:
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return res.status(500).json({
    ok: false,
    error: { code: ErrorCodes.AUTH_ERROR, message: error.message }
  });

  // * Step-4 Create the User Profile:

  const userProfile = await prisma.profile.create({
    data: {
      id: data.user?.id,
      username,
      timezone
    }
  });

  if (!userProfile) return res.status(500).json({
    ok: false,
    error: {code: ErrorCodes.INTERNAL_SERVER_ERROR, message: 'Failed to Create Profile'}
  })

  // * Step-5 return a response for a successful registration:

  return res.status(201).json({
    ok: true,
    data: {
      username,
      message: "User registered Sucessfully"
    }
  });

})
