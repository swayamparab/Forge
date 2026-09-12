"use client";

import type { ProjectFile } from "@/services/file";

interface FileTreeItemProps {
    file: ProjectFile;
    filesByParent: Map<string | null, ProjectFile[]>;
    expandedFolders: Set<string>;
    selectedFileId: string | null;
    selectedFolderId: string | null;
    onToggleFolder: (fileId: string) => void;
    onSelectFile: (fileId: string) => void;
    onSelectFolder: (fileId: string) => void;
    onContextMenu: (
        event: React.MouseEvent,
        file: ProjectFile,
    ) => void;
}

export default function FileTreeItem({
    file,
    filesByParent,
    expandedFolders,
    selectedFileId,
    selectedFolderId,
    onToggleFolder,
    onSelectFile,
    onSelectFolder,
    onContextMenu,
}: FileTreeItemProps) {
    const isFolder =
        file.type === "folder";

    const isExpanded =
        expandedFolders.has(file.id);

    const isSelected = isFolder
        ? file.id === selectedFolderId
        : file.id === selectedFileId;

    const children =
        filesByParent.get(file.id) ?? [];

    function handleClick() {
        if (isFolder) {
            onSelectFolder(file.id);
            onToggleFolder(file.id);
        } else {
            onSelectFile(file.id);
        }
    }

    return (
        <div>
            <div
                onContextMenu={(event) =>
                    onContextMenu(
                        event,
                        file,
                    )
                }
                className="rounded-md"
            >
                <button
                    type="button"
                    onClick={handleClick}
                    className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs transition ${isSelected
                            ? "bg-zinc-800 text-zinc-100"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                        }`}
                >
                    {isFolder ? (
                        <span className="flex w-3 items-center justify-center text-[10px] text-zinc-600">
                            {isExpanded
                                ? "▼"
                                : "▶"}
                        </span>
                    ) : (
                        <span className="w-3" />
                    )}

                    <span className="text-sm">
                        {isFolder
                            ? "📁"
                            : "📄"}
                    </span>

                    <span className="truncate">
                        {file.name}
                    </span>
                </button>
            </div>

            {isFolder &&
                isExpanded &&
                children.length > 0 && (
                    <div className="ml-4 border-l border-zinc-800 pl-1">
                        {children.map(
                            (child) => (
                                <FileTreeItem
                                    key={
                                        child.id
                                    }
                                    file={
                                        child
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
                                />
                            ),
                        )}
                    </div>
                )}
        </div>
    );
}