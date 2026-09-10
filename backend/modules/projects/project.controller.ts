import type { Request, Response } from "express";

import { createProject, deleteProject, getProjectById, getUserProjects, updateProject } from "./project.service.js";
import { createProjectSchema, updateProjectSchema } from "./project.validation.js";

export async function createProjectController(req: Request, res: Response) {
    try {
        const result = createProjectSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid project data",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const project = await createProject(
            req.userId,
            result.data,
        );

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            project,
        });
    } catch (error) {
        console.error("Create project error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function getUserProjectsController(req: Request, res: Response,) {
    try {
        const projects = await getUserProjects(req.userId);

        return res.status(200).json({
            success: true,
            projects,
        });
    } catch (error) {
        console.error("Get projects error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function getProjectByIdController(req: Request, res: Response,) {
    try {

        const projectId = req.params.projectId;

        if (typeof projectId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        const project = await getProjectById(projectId, req.userId,);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        return res.status(200).json({
            success: true,
            project,
        });
    } catch (error) {
        console.error("Get project error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function updateProjectController(req: Request, res: Response,) {
    try {

        const projectId = req.params.projectId;

        if (typeof projectId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        const result = updateProjectSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid project data",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const project = await updateProject(projectId, req.userId, result.data,);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project,
        });
    } catch (error) {
        console.error("Update project error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export async function deleteProjectController(req: Request, res: Response,) {
    try {
        const projectId = req.params.projectId;

        if (typeof projectId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        const project = await deleteProject(projectId, req.userId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });
    } catch (error) {
        console.error("Delete project error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}