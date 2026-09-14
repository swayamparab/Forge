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