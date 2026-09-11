"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { useProjectFiles } from "@/hooks/useProjectFiles";
import { useFile } from "@/hooks/useFile";
import type { ProjectFile } from "@/services/file";

interface FileTreeItemProps {
    file: ProjectFile;
    filesByParent: Map<string | null, ProjectFile[]>;
    expandedFolders: Set<string>;
    onToggleFolder: (fileId: string) => void;
    onSelectFile: (fileId: string) => void;
}

function FileTreeItem({
    file,
    filesByParent,
    expandedFolders,
    onToggleFolder,
    onSelectFile,
}: FileTreeItemProps) {
    const isFolder = file.type === "folder";
    const isExpanded = expandedFolders.has(file.id);

    const children = filesByParent.get(file.id) ?? [];

    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    if (isFolder) {
                        onToggleFolder(file.id);
                    } else {
                        onSelectFile(file.id);
                    }
                }}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
            >
                {isFolder ? (
                    <span className="w-3 text-[10px] text-zinc-600">
                        {isExpanded ? "▼" : "▶"}
                    </span>
                ) : (
                    <span className="w-3" />
                )}

                <span className="text-sm">
                    {isFolder ? "📁" : "📄"}
                </span>

                <span className="truncate">
                    {file.name}
                </span>
            </button>

            {isFolder &&
                isExpanded &&
                children.length > 0 && (
                    <div className="ml-4 border-l border-zinc-800 pl-1">
                        {children.map((child) => (
                            <FileTreeItem
                                key={child.id}
                                file={child}
                                filesByParent={
                                    filesByParent
                                }
                                expandedFolders={
                                    expandedFolders
                                }
                                onToggleFolder={
                                    onToggleFolder
                                }
                                onSelectFile={
                                    onSelectFile
                                }
                            />
                        ))}
                    </div>
                )}
        </div>
    );
}

export default function ProjectWorkspacePage() {
    const params = useParams();

    const projectId = params.projectId as string;

    const [selectedFileId, setSelectedFileId] =
        useState<string | null>(null);

    const [expandedFolders, setExpandedFolders] =
        useState<Set<string>>(new Set());

    const filesQuery = useProjectFiles(projectId);

    const selectedFileQuery = useFile(
        projectId,
        selectedFileId,
    );

    const files: ProjectFile[] =
        filesQuery.data?.files ?? [];

    const filesByParent = useMemo(() => {
        const map = new Map<
            string | null,
            ProjectFile[]
        >();

        for (const file of files) {
            const parentId = file.parentId;

            if (!map.has(parentId)) {
                map.set(parentId, []);
            }

            map.get(parentId)!.push(file);
        }

        for (const children of map.values()) {
            children.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === "folder"
                        ? -1
                        : 1;
                }

                return a.name.localeCompare(b.name);
            });
        }

        return map;
    }, [files]);

    function toggleFolder(fileId: string) {
        setExpandedFolders((current) => {
            const next = new Set(current);

            if (next.has(fileId)) {
                next.delete(fileId);
            } else {
                next.add(fileId);
            }

            return next;
        });
    }

    const rootFiles = filesByParent.get(null) ?? [];

    const selectedFile =
        selectedFileQuery.data?.file ?? null;

    return (
        <main className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
            {/* Top Bar */}
            <header className="flex h-12 shrink-0 items-center border-b border-zinc-800 bg-zinc-950">
                <div className="flex h-full items-center border-r border-zinc-800 px-4">
                    <Link
                        href="/dashboard"
                        className="text-sm font-semibold tracking-tight text-zinc-200 transition hover:text-white"
                    >
                        Forge
                    </Link>
                </div>

                <div className="flex min-w-0 flex-1 items-center px-4">
                    <span className="truncate text-sm text-zinc-400">
                        Project
                    </span>

                    <span className="mx-2 text-zinc-700">
                        /
                    </span>

                    <span className="truncate text-sm font-medium text-zinc-200">
                        {projectId}
                    </span>
                </div>

                <div className="flex items-center gap-2 px-4">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    <span className="text-xs text-zinc-500">
                        Connected
                    </span>
                </div>
            </header>

            {/* Workspace */}
            <div className="flex min-h-0 flex-1">
                {/* Explorer */}
                <aside className="w-60 shrink-0 border-r border-zinc-800 bg-zinc-950">
                    <div className="flex h-10 items-center border-b border-zinc-800 px-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                            Explorer
                        </span>
                    </div>

                    <div className="p-2">
                        {filesQuery.isLoading && (
                            <p className="px-2 py-2 text-xs text-zinc-600">
                                Loading files...
                            </p>
                        )}

                        {filesQuery.isError && (
                            <p className="px-2 py-2 text-xs text-red-400">
                                Failed to load project files
                            </p>
                        )}

                        {!filesQuery.isLoading &&
                            !filesQuery.isError &&
                            rootFiles.length === 0 && (
                                <p className="px-2 py-2 text-xs text-zinc-600">
                                    No files yet
                                </p>
                            )}

                        {!filesQuery.isLoading &&
                            !filesQuery.isError &&
                            rootFiles.length > 0 && (
                                <div className="space-y-0.5">
                                    {rootFiles.map((file) => (
                                        <FileTreeItem
                                            key={file.id}
                                            file={file}
                                            filesByParent={
                                                filesByParent
                                            }
                                            expandedFolders={
                                                expandedFolders
                                            }
                                            onToggleFolder={
                                                toggleFolder
                                            }
                                            onSelectFile={
                                                setSelectedFileId
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                    </div>
                </aside>

                {/* Main Editor Area */}
                <section className="flex min-w-0 flex-1 flex-col">
                    {/* Tabs */}
                    <div className="flex h-10 shrink-0 items-center border-b border-zinc-800 bg-zinc-900/30">
                        <div className="flex h-full items-center border-r border-zinc-800 bg-zinc-950 px-4">
                            <span className="text-xs text-zinc-300">
                                {selectedFile?.name ??
                                    "Welcome"}
                            </span>

                            {selectedFile && (
                                <button
                                    type="button"
                                    className="ml-3 text-zinc-600 transition hover:text-zinc-300"
                                    aria-label="Close tab"
                                    onClick={() =>
                                        setSelectedFileId(
                                            null,
                                        )
                                    }
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="min-h-0 flex-1 overflow-auto bg-zinc-950">
                        {!selectedFileId && (
                            <div className="flex h-full items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-sm font-medium text-zinc-400">
                                        Forge Workspace
                                    </h1>

                                    <p className="mt-2 text-xs text-zinc-600">
                                        Select a file from the
                                        Explorer to start
                                        editing.
                                    </p>
                                </div>
                            </div>
                        )}

                        {selectedFileQuery.isLoading && (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-xs text-zinc-600">
                                    Loading file...
                                </p>
                            </div>
                        )}

                        {selectedFileQuery.isError && (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-xs text-red-400">
                                    Failed to load file
                                </p>
                            </div>
                        )}

                        {selectedFile && (
                            <pre className="h-full overflow-auto p-6 font-mono text-sm leading-6 text-zinc-300">
                                {selectedFile.content ?? ""}
                            </pre>
                        )}
                    </div>
                </section>

                {/* Right Panel */}
                <aside className="hidden w-64 shrink-0 border-l border-zinc-800 bg-zinc-950 lg:block">
                    <div className="flex h-10 items-center border-b border-zinc-800 px-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                            Panel
                        </span>
                    </div>

                    <div className="p-4">
                        <p className="text-xs text-zinc-600">
                            Additional tools will appear
                            here.
                        </p>
                    </div>
                </aside>
            </div>

            {/* Status Bar */}
            <footer className="flex h-6 shrink-0 items-center justify-between border-t border-zinc-800 bg-zinc-900/70 px-3 text-[10px] text-zinc-500">
                <div className="flex items-center gap-4">
                    <span>main</span>
                    <span>Ready</span>
                </div>

                <div className="flex items-center gap-4">
                    <span>Ln 1, Col 1</span>
                    <span>UTF-8</span>
                    <span>TypeScript</span>
                </div>
            </footer>
        </main>
    );
}