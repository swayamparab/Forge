import type { FileSystemTree } from "@webcontainer/api";

import type { ProjectFile } from "@/services/file";

export function buildWebContainerFiles(
    files: ProjectFile[],
): FileSystemTree {
    const tree: FileSystemTree = {};

    const childrenByParent = new Map<
        string | null,
        ProjectFile[]
    >();

    for (const file of files) {
        const children =
            childrenByParent.get(file.parentId) ?? [];

        children.push(file);

        childrenByParent.set(
            file.parentId,
            children,
        );
    }

    function buildDirectory(
        parentId: string | null,
    ): FileSystemTree {
        const directory: FileSystemTree = {};

        const children =
            childrenByParent.get(parentId) ?? [];

        for (const file of children) {
            if (file.type === "file") {
                directory[file.name] = {
                    file: {
                        contents: file.content ?? "",
                    },
                };
            } else {
                directory[file.name] = {
                    directory:
                        buildDirectory(file.id),
                };
            }
        }

        return directory;
    }

    return buildDirectory(null);
}

export function getProjectFilePath(
    fileId: string,
    files: ProjectFile[],
): string {
    const fileById = new Map(
        files.map((file) => [file.id, file]),
    );

    const parts: string[] = [];
    const visited = new Set<string>();

    let current = fileById.get(fileId);

    if (!current) {
        throw new Error(
            "File not found in project.",
        );
    }

    while (current) {
        if (visited.has(current.id)) {
            throw new Error(
                "Invalid project file hierarchy.",
            );
        }

        visited.add(current.id);
        parts.unshift(current.name);

        if (!current.parentId) {
            break;
        }

        current = fileById.get(
            current.parentId,
        );

        if (!current) {
            throw new Error(
                "Invalid project file hierarchy.",
            );
        }
    }

    return `/${parts.join("/")}`;
}