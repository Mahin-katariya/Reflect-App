import { z } from "zod";


export const CreateTopicInput = z.object({
  title: z.string().min(1),
  description: z.string().max(450).default("")
});

export type CreateTypeInput = z.infer<typeof CreateTopicInput>;
