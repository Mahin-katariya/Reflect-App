import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Request, Response, NextFunction } from "express";
import { ErrorCodes } from "../error.js";

import "express";
declare module "express-serve-static-core" {
  interface Request {
    userId: string;
  }
}

const jwks = createRemoteJWKSet(

  // ? URL Pattern: https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json
  new URL(`${process.env.SUPABASE_URL!}/auth/v1/.well-known/jwks.json`),

);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer")) return res.status(401).json({
    ok: false,
    error: { code: ErrorCodes.UNAUTHORIZED, message: "Missing or Malformed Authorization Header" }
  });

  const token = header.slice(7);

  try {
    const { payload, protectedHeader } = await jwtVerify(token, jwks);

    console.log("========== payload data ===========");
    console.log(payload);
    console.log("=================================");

    if (!payload.sub) return res.status(401).json({
      ok: false,
      error: { code: ErrorCodes.UNAUTHORIZED, message: 'Failed to authorize' }
    });

    req.userId = payload.sub
    next();
  } catch(err) {
    return res.status(401).json({
      ok: false,
      error: { code: ErrorCodes.UNAUTHORIZED, message: err }
    });
  }
}
