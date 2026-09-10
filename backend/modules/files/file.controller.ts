import type { Request, Response } from "express";

import {
    createFileSchema,
    updateFileSchema,
} from "./file.validation.js";

import {
    createFile,
    deleteFile,
    getFile,
    getProjectFiles,
    updateFile,
} from "./file.service.js";

export async function createFileController(req: Request, res: Response) {

    const { projectId } = req.params;

    if (typeof projectId !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID",
        });
    }

    const result = createFileSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        const file = await createFile(
            projectId,
            req.userId,
            result.data,
        );

        return res.status(201).json({
            success: true,
            file,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "PROJECT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Project not found",
                });
            }

            if (error.message === "PARENT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Parent folder not found",
                });
            }

            if (error.message === "PARENT_NOT_FOLDER") {
                return res.status(400).json({
                    success: false,
                    message: "Parent must be a folder",
                });
            }

            if (error.message === "FILE_NAME_EXISTS") {
                return res.status(409).json({
                    success: false,
                    message:
                        "A file or folder with this name already exists here",
                });
            }
        }

        console.error("Create file error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create file",
        });
    }
}

export async function getFilesController(req: Request, res: Response) {
    const { projectId } = req.params;

    if (typeof projectId !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID",
        });
    }

    const parentId =
        typeof req.query.parentId === "string"
            ? req.query.parentId
            : null;

    try {
        const files = await getProjectFiles(
            projectId,
            req.userId,
            parentId,
        );

        return res.status(200).json({
            success: true,
            files,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "PROJECT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Project not found",
                });
            }

            if (error.message === "PARENT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Parent folder not found",
                });
            }

            if (error.message === "PARENT_NOT_FOLDER") {
                return res.status(400).json({
                    success: false,
                    message: "Parent must be a folder",
                });
            }
        }

        console.error("Get files error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch files",
        });
    }
}

export async function getFileController(req: Request, res: Response) {
    const { projectId, fileId } = req.params;

    if (
        typeof projectId !== "string" ||
        typeof fileId !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid project or file ID",
        });
    }

    try {
        const file = await getFile(
            projectId,
            req.userId,
            fileId,
        );

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

        return res.status(200).json({
            success: true,
            file,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "PROJECT_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        console.error("Get file error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch file",
        });
    }
}

export async function updateFileController(req: Request, res: Response) {
    const { projectId, fileId } = req.params;

    if (
        typeof projectId !== "string" ||
        typeof fileId !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid project or file ID",
        });
    }

    const result = updateFileSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        const file = await updateFile(
            projectId,
            req.userId,
            fileId,
            result.data,
        );

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

        return res.status(200).json({
            success: true,
            file,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "PROJECT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Project not found",
                });
            }

            if (error.message === "FILE_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "File not found",
                });
            }

            if (error.message === "PARENT_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Parent folder not found",
                });
            }

            if (error.message === "PARENT_NOT_FOLDER") {
                return res.status(400).json({
                    success: false,
                    message: "Parent must be a folder",
                });
            }

            if (error.message === "INVALID_PARENT") {
                return res.status(400).json({
                    success: false,
                    message: "A file or folder cannot be its own parent",
                });
            }
        }

        console.error("Update file error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update file",
        });
    }
}

export async function deleteFileController(req: Request, res: Response) {
    const { projectId, fileId } = req.params;

    if (
        typeof projectId !== "string" ||
        typeof fileId !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid project or file ID",
        });
    }

    try {
        const file = await deleteFile(
            projectId,
            req.userId,
            fileId,
        );

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "File deleted successfully",
            file,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "PROJECT_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        console.error("Delete file error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete file",
        });
    }
}