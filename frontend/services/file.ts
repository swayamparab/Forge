import api from "@/lib/api";

export interface ProjectFile {
    id: string;
    projectId: string;
    parentId: string | null;
    name: string;
    type: "file" | "folder";
    content?: string | null;
    createdAt: string;
    updatedAt: string;
}

interface FilesResponse {
    success: boolean;
    files: ProjectFile[];
}

interface FileResponse {
    success: boolean;
    file: ProjectFile;
}

export async function getProjectFiles(projectId: string) {
    const response = await api.get<FilesResponse>(`/api/projects/${projectId}/files`);

    return response.data;
}

export async function getFile(
    projectId: string,
    fileId: string,
) {
    const response = await api.get<FileResponse>(`/api/projects/${projectId}/files/${fileId}`);

    return response.data;
}

export async function createFile(
    projectId: string,
    data: {
        name: string;
        type: "file" | "folder";
        parentId?: string | null;
        content?: string;
    },
) {
    const response = await api.post<FileResponse>(`/api/projects/${projectId}/files`,
        data
    );

    return response.data;
}

export async function updateFile(
    projectId: string,
    fileId: string,
    data: {
        name?: string;
        content?: string;
        parentId?: string | null;
    },
) {
    const response = await api.patch<FileResponse>(`/api/projects/${projectId}/files/${fileId}`,
        data
    );

    return response.data;
}

export async function deleteFile(
    projectId: string,
    fileId: string,
) {
    const response = await api.delete<{
        success: boolean;
        message: string;
    }>(
        `/api/projects/${projectId}/files/${fileId}`,
    );

    return response.data;
}