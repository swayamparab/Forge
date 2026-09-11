import api from "@/lib/api";

export interface Project {
    id: string;
    ownerId?: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ProjectsResponse {
    success: boolean;
    projects: Project[];
}

interface ProjectResponse {
    success: boolean;
    project: Project;
}

export async function getProjects() {
    const response = await api.get<ProjectsResponse>("/api/projects");

    return response.data;
}

export async function getProject(
    projectId: string,
) {
    const response = await api.get<ProjectResponse>(`/api/projects/${projectId}`);

    return response.data;
}

export async function createProject(data: {
    name: string;
    description?: string;
}) {
    const response = await api.post<ProjectResponse>("/api/projects",
        data
    );

    return response.data;
}

export async function updateProject(
    projectId: string,
    data: {
        name?: string;
        description?: string;
    },
) {
    const response = await api.patch<ProjectResponse>(`/api/projects/${projectId}`,
        data
    );

    return response.data;
}

export async function deleteProject(
    projectId: string,
) {
    const response = await api.delete<{
        success: boolean;
        message: string;
    }>(`/api/projects/${projectId}`);

    return response.data;
}