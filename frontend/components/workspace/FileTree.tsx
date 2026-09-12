"use client";

import type { ProjectFile } from "@/services/file";
import FileTreeItem from "./FileTreeItem";

interface FileTreeProps {
    files: ProjectFile[];
    filesByParent: Map<string | null, ProjectFile[]>;
    expandedFolders: Set<string>;
    selectedFileId: string | null;
    selectedFolderId: string | null;
    isLoading: boolean;
    isError: boolean;
    onToggleFolder: (fileId: string) => void;
    onSelectFile: (fileId: string) => void;
    onSelectFolder: (fileId: string) => void;
    onClearSelection: () => void;
    onContextMenu: (
        event: React.MouseEvent,
        file: ProjectFile,
    ) => void;
    onRootContextMenu: (
        event: React.MouseEvent,
    ) => void;
    onMoveFile: (
        fileId: string,
        parentId: string | null,
    ) => void;
}

export default function FileTree({
    files,
    filesByParent,
    expandedFolders,
    selectedFileId,
    selectedFolderId,
    isLoading,
    isError,
    onToggleFolder,
    onSelectFile,
    onSelectFolder,
    onClearSelection,
    onContextMenu,
    onRootContextMenu,
    onMoveFile
}: FileTreeProps) {

    const rootFiles = filesByParent.get(null) ?? [];

    function handleRootDragOver(
        event: React.DragEvent<HTMLDivElement>,
    ) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }

    function handleRootDrop(
        event: React.DragEvent<HTMLDivElement>,
    ) {
        event.preventDefault();

        const fileId =
            event.dataTransfer.getData(
                "text/plain",
            );

        if (!fileId) {
            return;
        }

        onMoveFile(fileId, null);
    }

    return (
        <div
            className="h-[calc(100vh-106px)] overflow-y-auto p-2"
            onClick={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClearSelection();
                }
            }}
            onContextMenu={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onRootContextMenu(
                        event,
                    );
                }
            }}
        >
            {isLoading && (
                <p className="px-2 py-2 text-xs text-zinc-600">
                    Loading files...
                </p>
            )}

            {isError && (
                <p className="px-2 py-2 text-xs text-red-400">
                    Failed to load project
                    files
                </p>
            )}

            {!isLoading &&
                !isError &&
                rootFiles.length === 0 && (
                    <p className="px-2 py-2 text-xs text-zinc-600">
                        No files yet
                    </p>
                )}

            {!isLoading &&
                !isError &&
                rootFiles.length > 0 && (
                    <div className="space-y-0.5">
                        {rootFiles.map(
                            (file) => (
                                <FileTreeItem
                                    key={
                                        file.id
                                    }
                                    file={
                                        file
                                    }
                                    filesByParent={
                                        filesByParent
                                    }
                                    expandedFolders={
                                        expandedFolders
                                    }
                                    selectedFileId={
                                        selectedFileId
                                    }
                                    selectedFolderId={
                                        selectedFolderId
                                    }
                                    onToggleFolder={
                                        onToggleFolder
                                    }
                                    onSelectFile={
                                        onSelectFile
                                    }
                                    onSelectFolder={
                                        onSelectFolder
                                    }
                                    onContextMenu={
                                        onContextMenu
                                    }
                                    onMoveFile={
                                        onMoveFile
                                    }
                                />
                            ),
                        )}
                    </div>
                )}

            {/* Root background */}
            <div
                className="min-h-32"
                onDragOver={handleRootDragOver}
                onDrop={handleRootDrop}
                onClick={(event) => {
                    event.stopPropagation();
                    onClearSelection();
                }}
                onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onRootContextMenu(
                        event,
                    );
                }}
            />
        </div>
    );
}