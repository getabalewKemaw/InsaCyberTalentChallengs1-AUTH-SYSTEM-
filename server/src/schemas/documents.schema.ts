import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  content: z.string().optional(),
});

export const shareDocumentSchema = z.object({
  email: z.string().email("Valid email is required"),
  permissionLevel: z.enum(["viewer", "commenter", "editor"]),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

export const updateCommentSchema = z.object({
  resolved: z.boolean().optional(),
  content: z.string().optional(),
});


