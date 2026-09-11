"use client";

import { useQuery } from "@tanstack/react-query";

import { getProjectFiles } from "@/services/file";

export function useProjectFiles(projectId: string) {
    return useQuery({
        queryKey: ["project-files", projectId],
        queryFn: () => getProjectFiles(projectId),
        enabled: Boolean(projectId),
    });
}