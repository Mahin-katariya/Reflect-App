import { z } from "zod";


export const CreateTopicInput = z.object({
  title: z.string().min(1),
  description: z.string().max(450).default("")
});

export type CreateTypeInput = z.infer<typeof CreateTopicInput>;

// Partial update — description can be set/cleared after creation. `.optional()`
// with NO default so an omitted field is left untouched (same gotcha as logs:
// a default would silently overwrite). Empty string is allowed = cleared.
export const UpdateTopicInput = z.object({
  description: z.string().trim().max(450).optional(),
});

export type UpdateTopicInput = z.infer<typeof UpdateTopicInput>;
