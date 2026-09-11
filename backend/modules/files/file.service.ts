import { and, eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { projectFiles, projects } from "../../db/schema/index.js";

interface CreateFileInput {
    name: string;
    type: "file" | "folder";
    parentId?: string | null | undefined;
    content?: string | undefined;
}

interface UpdateFileInput {
    name?: string | undefined;
    content?: string | undefined;
    parentId?: string | null | undefined;
}

async function verifyProjectOwnership(
    projectId: string,
    userId: string,
) {
    const [project] = await db
        .select({
            id: projects.id,
        })
        .from(projects)
        .where(
            and(
                eq(projects.id, projectId),
                eq(projects.ownerId, userId),
            ),
        )
        .limit(1);

    return project;
}

async function verifyParentFolder(
    projectId: string,
    parentId: string,
) {
    const [parent] = await db
        .select({
            id: projectFiles.id,
            type: projectFiles.type,
        })
        .from(projectFiles)
        .where(
            and(
                eq(projectFiles.id, parentId),
                eq(projectFiles.projectId, projectId),
            ),
        )
        .limit(1);

    if (!parent) {
        throw new Error("PARENT_NOT_FOUND");
    }

    if (parent.type !== "folder") {
        throw new Error("PARENT_NOT_FOLDER");
    }

    return parent;
}

export async function createFile(
    projectId: string,
    userId: string,
    input: CreateFileInput,
) {
    const project = await verifyProjectOwnership(
        projectId,
        userId,
    );

    if (!project) {
        throw new Error("PROJECT_NOT_FOUND");
    }

    if (input.parentId) {
        await verifyParentFolder(
            projectId,
            input.parentId,
        );
    }

    const content =
        input.type === "file"
            ? input.content ?? ""
            : null;

    try {
        const [file] = await db
            .insert(projectFiles)
            .values({
                projectId,
                parentId: input.parentId ?? null,
                name: input.name,
                type: input.type,
                content,
            })
            .returning({
                id: projectFiles.id,
                projectId: projectFiles.projectId,
                parentId: projectFiles.parentId,
                name: projectFiles.name,
                type: projectFiles.type,
                content: projectFiles.content,
                createdAt: projectFiles.createdAt,
                updatedAt: projectFiles.updatedAt,
            });

        if (!file) {
            throw new Error("FILE_CREATION_FAILED");
        }

        return file;
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.includes(
                "project_files_project_parent_name_unique",
            )
        ) {
            throw new Error("FILE_NAME_EXISTS");
        }

        throw error;
    }
}

export async function getProjectFiles(
    projectId: string,
    userId: string,
) {
    const project = await verifyProjectOwnership(
        projectId,
        userId,
    );

    if (!project) {
        throw new Error("PROJECT_NOT_FOUND");
    }

    return db
        .select({
            id: projectFiles.id,
            projectId: projectFiles.projectId,
            parentId: projectFiles.parentId,
            name: projectFiles.name,
            type: projectFiles.type,
            content: projectFiles.content,
            createdAt: projectFiles.createdAt,
            updatedAt: projectFiles.updatedAt,
        })
        .from(projectFiles)
        .where(
            eq(projectFiles.projectId, projectId),
        );
}

export async function getFile(
    projectId: string,
    userId: string,
    fileId: string,
) {
    const project = await verifyProjectOwnership(
        projectId,
        userId,
    );

    if (!project) {
        throw new Error("PROJECT_NOT_FOUND");
    }

    const [file] = await db
        .select({
            id: projectFiles.id,
            projectId: projectFiles.projectId,
            parentId: projectFiles.parentId,
            name: projectFiles.name,
            type: projectFiles.type,
            content: projectFiles.content,
            createdAt: projectFiles.createdAt,
            updatedAt: projectFiles.updatedAt,
        })
        .from(projectFiles)
        .where(
            and(
                eq(projectFiles.id, fileId),
                eq(projectFiles.projectId, projectId),
            ),
        )
        .limit(1);

    return file;
}

export async function updateFile(
    projectId: string,
    userId: string,
    fileId: string,
    input: UpdateFileInput,
) {
    const project = await verifyProjectOwnership(
        projectId,
        userId,
    );

    if (!project) {
        throw new Error("PROJECT_NOT_FOUND");
    }

    const [existingFile] = await db
        .select({
            id: projectFiles.id,
            type: projectFiles.type,
        })
        .from(projectFiles)
        .where(
            and(
                eq(projectFiles.id, fileId),
                eq(projectFiles.projectId, projectId),
            ),
        )
        .limit(1);

    if (!existingFile) {
        throw new Error("FILE_NOT_FOUND");
    }

    if (input.parentId) {
        if (input.parentId === fileId) {
            throw new Error("INVALID_PARENT");
        }

        await verifyParentFolder(
            projectId,
            input.parentId,
        );
    }

    const updateData: {
        name?: string;
        content?: string | null;
        parentId?: string | null;
        updatedAt: Date;
    } = {
        updatedAt: new Date(),
    };

    if (input.name !== undefined) {
        updateData.name = input.name;
    }

    if (existingFile.type === "file") {
        if (input.content !== undefined) {
            updateData.content = input.content;
        }
    }

    if (input.parentId !== undefined) {
        updateData.parentId = input.parentId;
    }

    const [updatedFile] = await db
        .update(projectFiles)
        .set(updateData)
        .where(
            and(
                eq(projectFiles.id, fileId),
                eq(projectFiles.projectId, projectId),
            ),
        )
        .returning({
            id: projectFiles.id,
            projectId: projectFiles.projectId,
            parentId: projectFiles.parentId,
            name: projectFiles.name,
            type: projectFiles.type,
            content: projectFiles.content,
            createdAt: projectFiles.createdAt,
            updatedAt: projectFiles.updatedAt,
        });

    return updatedFile;
}

export async function deleteFile(
    projectId: string,
    userId: string,
    fileId: string,
) {
    const project = await verifyProjectOwnership(
        projectId,
        userId,
    );

    if (!project) {
        throw new Error("PROJECT_NOT_FOUND");
    }

    const [deletedFile] = await db
        .delete(projectFiles)
        .where(
            and(
                eq(projectFiles.id, fileId),
                eq(projectFiles.projectId, projectId),
            ),
        )
        .returning({
            id: projectFiles.id,
            name: projectFiles.name,
            type: projectFiles.type,
        });

    return deletedFile;
}