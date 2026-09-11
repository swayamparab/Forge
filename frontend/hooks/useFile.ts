"use client";

import { useQuery } from "@tanstack/react-query";

import { getFile } from "@/services/file";

export function useFile(
    projectId: string,
    fileId: string | null,
) {
    return useQuery({
        queryKey: ["file", projectId, fileId],
        queryFn: () => getFile(projectId, fileId!),
        enabled: Boolean(projectId && fileId),
    });
}