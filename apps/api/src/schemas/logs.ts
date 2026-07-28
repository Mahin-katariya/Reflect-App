import { z } from "zod";

const ResourceInput = z.object({
  url: z.url().trim(),
  title: z.string().trim().optional(),
});

export const CreateLogInput = z.object({
  title: z.string().trim().min(1),
  notes: z.string().trim().max(10000).default(""),
  resources: z.array(ResourceInput).default([])
});

export type CreateLogInput = z.infer<typeof CreateLogInput>;
export type ResourceInput = z.infer<typeof ResourceInput>

// NOTE: not CreateLogInput.partial() — .partial() keeps the .default()s, so an
// absent key parses to its default ("" / []) instead of undefined, and the PATCH
// handler would then overwrite fields the client never sent. Explicit .optional()
// with no defaults keeps absent keys undefined so partial updates stay partial.
export const UpdateLogInput = z.object({
  title: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(2500).optional(),
  resources: z.array(ResourceInput).optional(),
});
export type UpdateLogInput = z.infer<typeof UpdateLogInput>;
