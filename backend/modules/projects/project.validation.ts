import { z } from "zod";

export const createProjectSchema = z.object({

    name: z
        .string()
        .trim()
        .min(1, "Project name is requireed")
        .max(100, "Project name cannot exceed 100 characters"),

    description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional()

})

export const updateProjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Project name cannot be empty")
        .max(100, "Project name cannot exceed 100 characters")
        .optional(),

    description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),
});