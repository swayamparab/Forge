"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getFile,
    updateFile,
} from "@/services/file";

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

export function useUpdateFile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            projectId,
            fileId,
            content,
        }: {
            projectId: string;
            fileId: string;
            content: string;
        }) =>
            updateFile(projectId, fileId, {
                content,
            }),

        onSuccess: (response, variables) => {
            queryClient.setQueryData(
                [
                    "file",
                    variables.projectId,
                    variables.fileId,
                ],
                response,
            );

            queryClient.invalidateQueries({
                queryKey: [
                    "project-files",
                    variables.projectId,
                ],
            });
        },
    });
}