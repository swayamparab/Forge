import { z } from "zod";

export const createFileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "File or folder name is required")
        .max(255, "File or folder name cannot exceed 255 characters"),

    type: z.enum(["file", "folder"]),

    parentId: z
        .string()
        .uuid("Invalid parent folder ID")
        .nullable()
        .optional(),

    content: z
        .string()
        .optional(),
});

export const updateFileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "File or folder name cannot be empty")
        .max(255, "File or folder name cannot exceed 255 characters")
        .optional(),

    content: z
        .string()
        .optional(),

    parentId: z
        .string()
        .uuid("Invalid parent folder ID")
        .nullable()
        .optional(),
});