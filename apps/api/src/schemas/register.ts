import { z } from "zod";

export const RegisterInput = z.object({
  email: z.email(),
  password: z.string().min(8).max(30),
  username: z.string().min(3),
  timezone: z.string().min(1)
})


export type RegisterInput = z.infer<typeof RegisterInput>;
