import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(100),
  description: z.string().min(5, "Description must be at least 5 characters").max(500),
  problem: z.string().max(1000).optional().default(""),
  goal: z.string().max(1000).optional().default(""),
  currentStatus: z.string().max(500).optional().default(""),
});

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  shareAccess: z.enum(["VIEW", "EDIT"]).optional(),
});

export const CreateResourceSchema = z.object({
  title: z.string().min(2, "Title is required").max(150),
  description: z.string().max(1000).optional().default(""),
  url: z.string().url("Must be a valid URL"),
  category: z.string().default("Article"),
  tags: z.string().optional().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")),
  author: z.string().optional().default(""),
});

export const CreateIdeaSchema = z.object({
  title: z.string().min(2, "Title is required").max(150),
  description: z.string().max(1000).optional().default(""),
  contributor: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  status: z.enum(["New", "Discussing", "Accepted", "Rejected", "Implemented"]).default("New"),
});

export const CreateLinkSchema = z.object({
  name: z.string().min(2, "Link name is required").max(100),
  url: z.string().url("Must be a valid URL"),
  description: z.string().max(500).optional().default(""),
  category: z.string().default("Other"),
});

export const CreateDecisionSchema = z.object({
  decision: z.string().min(3, "Decision summary is required").max(200),
  context: z.string().max(1000).optional().default(""),
  chosenSolution: z.string().max(1000).optional().default(""),
  alternativesConsidered: z.string().max(1000).optional().default(""),
  madeBy: z.string().optional().default(""),
  date: z.string().optional(),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(2, "Title is required").max(150),
  description: z.string().max(1000).optional().default(""),
  assignee: z.string().optional().default(""),
  status: z.enum(["Backlog", "Todo", "In Progress", "Blocked", "Done"]).default("Todo"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).default("Medium"),
  dueDate: z.string().optional().nullable(),
  order: z.number().int().optional().default(0),
});

export const CreateWorkflowStepSchema = z.object({
  title: z.string().min(2, "Title is required").max(150),
  description: z.string().max(1000).optional().default(""),
  parentId: z.string().optional().nullable(),
  assignee: z.string().optional().default(""),
  notes: z.string().max(1000).optional().default(""),
  resources: z.string().optional().default(""),
  isCompleted: z.boolean().optional().default(false),
  order: z.number().int().optional().default(0),
});
