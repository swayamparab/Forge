"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import Link from "next/link";

import {
    useCreateFile,
    useCreateFolder,
    useProjectFiles,
} from "@/hooks/useProjectFiles";

import {
    useFile,
    useUpdateFile,
    useDeleteFile
} from "@/hooks/useFile";

import type { ProjectFile } from "@/services/file";

import CodeEditor from "@/components/editor/CodeEditor";

import {
    getLanguageFromFileName,
} from "@/lib/editor/language";

import FileTree from "./FileTree";
import CreateItemDialog from "./CreateItemDialog";
import WorkspaceDialog from "./WorkspaceDialog";

interface WorkspaceProps {
    projectId: string;
}

export default function Workspace({
    projectId,
}: WorkspaceProps) {
    const [
        selectedFileId,
        setSelectedFileId,
    ] = useState<string | null>(null);

    const [
        selectedFolderId,
        setSelectedFolderId,
    ] = useState<string | null>(null);

    const [
        expandedFolders,
        setExpandedFolders,
    ] = useState<Set<string>>(
        new Set(),
    );

    const [
        editorContent,
        setEditorContent,
    ] = useState("");

    const [
        hasUnsavedChanges,
        setHasUnsavedChanges,
    ] = useState(false);

    const [
        newItemType,
        setNewItemType,
    ] = useState<
        "file" | "folder" | null
    >(null);

    const [
        newItemName,
        setNewItemName,
    ] = useState("");

    const [
        createError,
        setCreateError,
    ] = useState<string | null>(
        null,
    );

    const [
        creationParentId,
        setCreationParentId,
    ] = useState<string | null>(
        null,
    );

    const [
        contextMenu,
        setContextMenu,
    ] = useState<{
        x: number;
        y: number;
        parentId: string | null;
        fileId?: string;
    } | null>(null);

    const [dialog, setDialog] = useState<{
        type: "rename" | "delete" | "move";
        fileId: string;
    } | null>(null);

    const filesQuery =
        useProjectFiles(projectId);

    const selectedFileQuery =
        useFile(
            projectId,
            selectedFileId,
        );

    const updateFileMutation =
        useUpdateFile();

    const deleteFileMutation =
        useDeleteFile();

    const createFileMutation =
        useCreateFile();

    const createFolderMutation =
        useCreateFolder();

    const files: ProjectFile[] =
        filesQuery.data?.files ?? [];

    const selectedFile =
        selectedFileQuery.data?.file ??
        null;

    useEffect(() => {
        if (selectedFile) {
            setEditorContent(
                selectedFile.content ??
                "",
            );

            setHasUnsavedChanges(
                false,
            );
        } else {
            setEditorContent("");
            setHasUnsavedChanges(
                false,
            );
        }
    }, [selectedFile]);

    const filesByParent = useMemo(() => {
        const map = new Map<
            string | null,
            ProjectFile[]
        >();

        for (const file of files) {
            const parentId =
                file.parentId;

            if (!map.has(parentId)) {
                map.set(
                    parentId,
                    [],
                );
            }

            map.get(parentId)!.push(
                file,
            );
        }

        for (const children of map.values()) {
            children.sort(
                (a, b) => {
                    if (
                        a.type !==
                        b.type
                    ) {
                        return a.type ===
                            "folder"
                            ? -1
                            : 1;
                    }

                    return a.name.localeCompare(
                        b.name,
                    );
                },
            );
        }

        return map;
    }, [files]);

    useEffect(() => {
        function handleBeforeUnload(
            event: BeforeUnloadEvent,
        ) {
            if (
                !hasUnsavedChanges
            ) {
                return;
            }

            event.preventDefault();
            event.returnValue = "";
        }

        window.addEventListener(
            "beforeunload",
            handleBeforeUnload,
        );

        return () => {
            window.removeEventListener(
                "beforeunload",
                handleBeforeUnload,
            );
        };
    }, [hasUnsavedChanges]);

    useEffect(() => {
        function handleOutsideContextMenuClick(
            event: MouseEvent,
        ) {
            const target =
                event.target;

            if (
                target instanceof Element &&
                target.closest(
                    "[data-context-menu]",
                )
            ) {
                return;
            }

            setContextMenu(null);
        }

        function handleEscape(
            event: KeyboardEvent,
        ) {
            if (
                event.key === "Escape"
            ) {
                setContextMenu(null);
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideContextMenuClick,
        );

        document.addEventListener(
            "keydown",
            handleEscape,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideContextMenuClick,
            );

            document.removeEventListener(
                "keydown",
                handleEscape,
            );
        };
    }, []);

    function toggleFolder(
        fileId: string,
    ) {
        setExpandedFolders(
            (current) => {
                const next =
                    new Set(
                        current,
                    );

                if (
                    next.has(
                        fileId,
                    )
                ) {
                    next.delete(
                        fileId,
                    );
                } else {
                    next.add(
                        fileId,
                    );
                }

                return next;
            },
        );
    }

    function handleSelectFolder(
        folderId: string,
    ) {
        setSelectedFolderId(
            folderId,
        );

        setSelectedFileId(
            null,
        );

        setContextMenu(null);
    }

    function clearExplorerSelection() {
        setSelectedFolderId(
            null,
        );

        setSelectedFileId(
            null,
        );

        setContextMenu(null);
    }

    function handleSelectFile(
        fileId: string,
    ) {
        if (
            fileId ===
            selectedFileId
        ) {
            setSelectedFolderId(
                null,
            );

            setContextMenu(null);

            return;
        }

        if (hasUnsavedChanges) {
            const shouldSwitch =
                window.confirm(
                    "You have unsaved changes. Are you sure you want to switch files?",
                );

            if (!shouldSwitch) {
                return;
            }
        }

        setSelectedFileId(
            fileId,
        );

        setSelectedFolderId(
            null,
        );

        setContextMenu(null);
    }

    function handleSave() {
        if (
            !selectedFileId ||
            !hasUnsavedChanges ||
            updateFileMutation.isPending
        ) {
            return;
        }

        updateFileMutation.mutate(
            {
                projectId,
                fileId:
                    selectedFileId,
                content:
                    editorContent,
            },
            {
                onSuccess: () => {
                    setHasUnsavedChanges(
                        false,
                    );
                },
            },
        );
    }

    function handleRename() {
        if (!contextMenu?.fileId) {
            return;
        }

        setDialog({
            type: "rename",
            fileId: contextMenu.fileId,
        });

        setContextMenu(null);
    }

    function handleDelete() {
        if (!contextMenu?.fileId) {
            return;
        }

        setDialog({
            type: "delete",
            fileId: contextMenu.fileId,
        });

        setContextMenu(null);
    }

    function handleDialogConfirm(value?: string) {
        if (!dialog) {
            return;
        }

        const file = files.find(
            (item) => item.id === dialog.fileId,
        );

        if (!file) {
            setDialog(null);
            return;
        }

        if (dialog.type === "rename") {
            const newName = value?.trim();

            if (!newName) {
                return;
            }

            updateFileMutation.mutate(
                {
                    projectId,
                    fileId: file.id,
                    name: newName,
                },
                {
                    onSuccess: () => {
                        setDialog(null);
                    },
                    onError: (error: any) => {
                        if (
                            error?.response?.status === 409
                        ) {
                            window.alert(
                                "A file or folder with this name already exists here.",
                            );
                            return;
                        }

                        window.alert(
                            "Failed to rename item.",
                        );
                    },
                },
            );

            return;
        }

        if (dialog.type === "move") {
            updateFileMutation.mutate(
                {
                    projectId,
                    fileId: file.id,
                    parentId: value || null,
                },
                {
                    onSuccess: () => {
                        setDialog(null);
                    },
                    onError: (error: any) => {
                        if (
                            error?.response?.status ===
                            409
                        ) {
                            window.alert(
                                "A file or folder with this name already exists in the destination.",
                            );
                            return;
                        }

                        if (
                            error?.response?.status ===
                            400
                        ) {
                            window.alert(
                                "This item cannot be moved to that folder.",
                            );
                            return;
                        }

                        window.alert(
                            "Failed to move item.",
                        );
                    },
                },
            );

            return;
        }

        deleteFileMutation.mutate(
            {
                projectId,
                fileId: file.id,
            },
            {
                onSuccess: () => {
                    let shouldClearSelectedFile =
                        selectedFileId === file.id;

                    if (
                        file.type === "folder" &&
                        selectedFileId
                    ) {
                        let currentFile = files.find(
                            (item) =>
                                item.id ===
                                selectedFileId,
                        );

                        while (currentFile?.parentId) {
                            if (
                                currentFile.parentId ===
                                file.id
                            ) {
                                shouldClearSelectedFile =
                                    true;
                                break;
                            }

                            currentFile = files.find(
                                (item) =>
                                    item.id ===
                                    currentFile?.parentId,
                            );
                        }
                    }

                    if (shouldClearSelectedFile) {
                        setSelectedFileId(null);
                        setEditorContent("");
                        setHasUnsavedChanges(false);
                    }

                    if (
                        selectedFolderId === file.id
                    ) {
                        setSelectedFolderId(null);
                    }

                    setExpandedFolders(
                        (current) => {
                            const next = new Set(
                                current,
                            );

                            next.delete(file.id);

                            return next;
                        },
                    );

                    setDialog(null);
                },
                onError: () => {
                    window.alert(
                        "Failed to delete item.",
                    );
                },
            },
        );
    }

    function handleCloseFile() {
        if (hasUnsavedChanges) {
            const shouldClose =
                window.confirm(
                    "You have unsaved changes. Are you sure you want to close this file?",
                );

            if (!shouldClose) {
                return;
            }
        }

        setSelectedFileId(
            null,
        );

        setSelectedFolderId(
            null,
        );
    }

    function getCreationParentId(): string | null {
        if (
            selectedFolderId
        ) {
            return selectedFolderId;
        }

        if (
            selectedFileId
        ) {
            const selectedFileForCreation =
                files.find(
                    (file) =>
                        file.id ===
                        selectedFileId,
                );

            if (
                selectedFileForCreation
            ) {
                return (
                    selectedFileForCreation.parentId ??
                    null
                );
            }
        }

        return null;
    }

    function openCreateDialog(
        type:
            | "file"
            | "folder",
        parentId?: string | null,
    ) {
        const resolvedParentId =
            parentId !==
                undefined
                ? parentId
                : getCreationParentId();

        setCreationParentId(
            resolvedParentId,
        );

        setNewItemType(
            type,
        );

        setNewItemName("");

        setCreateError(null);

        setContextMenu(null);
    }

    function closeCreateDialog() {
        if (
            createFileMutation.isPending ||
            createFolderMutation.isPending
        ) {
            return;
        }

        setNewItemType(
            null,
        );

        setNewItemName("");

        setCreateError(null);

        setCreationParentId(
            null,
        );
    }

    function getCreationLocationName() {
        if (
            !creationParentId
        ) {
            return "project root";
        }

        const parentFolder =
            files.find(
                (file) =>
                    file.id ===
                    creationParentId &&
                    file.type ===
                    "folder",
            );

        return (
            parentFolder?.name ??
            "selected folder"
        );
    }

    function handleCreate() {
        if (
            !newItemType
        ) {
            return;
        }

        const name =
            newItemName.trim();

        if (!name) {
            setCreateError(
                "Name cannot be empty.",
            );

            return;
        }

        const parentId =
            creationParentId;

        setCreateError(null);

        if (
            newItemType ===
            "file"
        ) {
            createFileMutation.mutate(
                {
                    projectId,
                    name,
                    parentId,
                    content: "",
                },
                {
                    onSuccess: (
                        response,
                    ) => {
                        setNewItemType(
                            null,
                        );

                        setNewItemName(
                            "",
                        );

                        setCreationParentId(
                            null,
                        );

                        setSelectedFileId(
                            response
                                .file
                                .id,
                        );

                        setSelectedFolderId(
                            null,
                        );

                        if (
                            parentId
                        ) {
                            setExpandedFolders(
                                (
                                    current,
                                ) => {
                                    const next =
                                        new Set(
                                            current,
                                        );

                                    next.add(
                                        parentId,
                                    );

                                    return next;
                                },
                            );
                        }
                    },

                    onError: (
                        error,
                    ) => {
                        if (
                            error instanceof
                            Error &&
                            error.message.includes(
                                "FILE_NAME_EXISTS",
                            )
                        ) {
                            setCreateError(
                                "A file or folder with this name already exists.",
                            );
                        } else {
                            setCreateError(
                                "Failed to create file.",
                            );
                        }
                    },
                },
            );

            return;
        }

        createFolderMutation.mutate(
            {
                projectId,
                name,
                parentId,
            },
            {
                onSuccess: (
                    response,
                ) => {
                    setNewItemType(
                        null,
                    );

                    setNewItemName(
                        "",
                    );

                    setCreationParentId(
                        null,
                    );

                    setSelectedFolderId(
                        response
                            .file
                            .id,
                    );

                    setSelectedFileId(
                        null,
                    );

                    setExpandedFolders(
                        (
                            current,
                        ) => {
                            const next =
                                new Set(
                                    current,
                                );

                            if (
                                parentId
                            ) {
                                next.add(
                                    parentId,
                                );
                            }

                            next.add(
                                response
                                    .file
                                    .id,
                            );

                            return next;
                        },
                    );
                },

                onError: (
                    error,
                ) => {
                    if (
                        error instanceof
                        Error &&
                        error.message.includes(
                            "FILE_NAME_EXISTS",
                        )
                    ) {
                        setCreateError(
                            "A file or folder with this name already exists.",
                        );
                    } else {
                        setCreateError(
                            "Failed to create folder.",
                        );
                    }
                },
            },
        );
    }

    function handleContextMenu(
        event: React.MouseEvent,
        file: ProjectFile,
    ) {
        event.preventDefault();
        event.stopPropagation();

        const parentId =
            file.type === "folder"
                ? file.id
                : file.parentId;

        if (
            file.type ===
            "folder"
        ) {
            setSelectedFolderId(
                file.id,
            );

            setSelectedFileId(
                null,
            );
        } else {
            setSelectedFileId(
                file.id,
            );

            setSelectedFolderId(
                null,
            );
        }

        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            parentId,
            fileId: file.id,
        });
    }

    function handleRootContextMenu(
        event: React.MouseEvent,
    ) {
        event.preventDefault();
        event.stopPropagation();

        setSelectedFolderId(
            null,
        );

        setSelectedFileId(
            null,
        );

        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            parentId: null,
        });
    }

    function handleMoveFile(
        fileId: string,
        parentId: string | null,
    ) {
        const file = files.find(
            (item) => item.id === fileId,
        );

        if (!file) {
            return;
        }

        // Already in this location.
        if (
            file.parentId === parentId
        ) {
            return;
        }

        // Prevent moving a folder into itself.
        if (file.id === parentId) {
            return;
        }

        // Prevent moving a folder into one of its descendants.
        if (
            file.type === "folder" &&
            parentId
        ) {
            let currentFile =
                files.find(
                    (item) =>
                        item.id === parentId,
                );

            while (currentFile?.parentId) {
                if (
                    currentFile.parentId ===
                    file.id
                ) {
                    window.alert(
                        "A folder cannot be moved into one of its own subfolders.",
                    );

                    return;
                }

                currentFile = files.find(
                    (item) =>
                        item.id ===
                        currentFile?.parentId,
                );
            }
        }

        updateFileMutation.mutate(
            {
                projectId,
                fileId,
                parentId,
            },
            {
                onError: (error: any) => {
                    if (
                        error?.response?.status ===
                        409
                    ) {
                        window.alert(
                            "A file or folder with this name already exists in the destination.",
                        );

                        return;
                    }

                    window.alert(
                        "Failed to move item.",
                    );
                },
            },
        );
    }

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                "s"
            ) {
                event.preventDefault();

                handleSave();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        selectedFileId,
        editorContent,
        hasUnsavedChanges,
        updateFileMutation.isPending,
    ]);

    const isCreating =
        createFileMutation.isPending ||
        createFolderMutation.isPending;

    return (
        <main className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
            {/* Top Bar */}
            <header className="flex h-12 shrink-0 items-center border-b border-zinc-800 bg-zinc-950">
                <div className="flex h-full items-center border-r border-zinc-800 px-4">
                    <Link
                        href="/dashboard"
                        className="text-sm font-semibold tracking-tight text-zinc-200 transition hover:text-white"
                    >
                        Mesh
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
                    <div className="flex h-10 items-center justify-between border-b border-zinc-800 px-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                            Explorer
                        </span>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                title={
                                    selectedFolderId
                                        ? "New File in selected folder"
                                        : "New File"
                                }
                                onClick={() =>
                                    openCreateDialog(
                                        "file",
                                    )
                                }
                                className="flex h-6 w-6 items-center justify-center rounded text-sm text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                            >
                                +
                            </button>

                            <button
                                type="button"
                                title={
                                    selectedFolderId
                                        ? "New Folder in selected folder"
                                        : "New Folder"
                                }
                                onClick={() =>
                                    openCreateDialog(
                                        "folder",
                                    )
                                }
                                className="flex h-6 w-6 items-center justify-center rounded text-sm text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                            >
                                📁
                            </button>
                        </div>
                    </div>

                    <FileTree
                        files={files}
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
                        isLoading={
                            filesQuery.isLoading
                        }
                        isError={
                            filesQuery.isError
                        }
                        onToggleFolder={
                            toggleFolder
                        }
                        onSelectFile={
                            handleSelectFile
                        }
                        onSelectFolder={
                            handleSelectFolder
                        }
                        onClearSelection={
                            clearExplorerSelection
                        }
                        onContextMenu={
                            handleContextMenu
                        }
                        onRootContextMenu={
                            handleRootContextMenu
                        }
                        onMoveFile={
                            handleMoveFile
                        }
                    />
                </aside>

                {/* Main Editor Area */}
                <section className="flex min-w-0 flex-1 flex-col">
                    {/* Tabs */}
                    <div className="flex h-10 shrink-0 items-center border-b border-zinc-800 bg-zinc-900/30">
                        <div className="flex h-full items-center border-r border-zinc-800 bg-zinc-950 px-4">
                            <span className="text-xs text-zinc-300">
                                {hasUnsavedChanges && (
                                    <span className="mr-1 text-zinc-400">
                                        ●
                                    </span>
                                )}

                                {selectedFile?.name ??
                                    "Welcome"}
                            </span>

                            {selectedFile && (
                                <button
                                    type="button"
                                    className="ml-3 text-zinc-600 transition hover:text-zinc-300"
                                    aria-label="Close tab"
                                    onClick={
                                        handleCloseFile
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
                                        Mesh Workspace
                                    </h1>

                                    <p className="mt-2 text-xs text-zinc-600">
                                        Select a file from
                                        the Explorer to
                                        start editing.
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
                            <CodeEditor
                                value={
                                    editorContent
                                }
                                language={getLanguageFromFileName(
                                    selectedFile.name,
                                )}
                                onChange={(
                                    value,
                                ) => {
                                    const nextValue =
                                        value ??
                                        "";

                                    setEditorContent(
                                        nextValue,
                                    );

                                    setHasUnsavedChanges(
                                        nextValue !==
                                        (selectedFile.content ??
                                            ""),
                                    );
                                }}
                            />
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
                            Additional tools will
                            appear here.
                        </p>
                    </div>
                </aside>
            </div>

            {/* Status Bar */}
            <footer className="flex h-6 shrink-0 items-center justify-between border-t border-zinc-800 bg-zinc-900/70 px-3 text-[10px] text-zinc-500">
                <div className="flex items-center gap-4">
                    <span>main</span>

                    <span>
                        {updateFileMutation.isPending
                            ? "Saving..."
                            : deleteFileMutation.isPending
                                ? "Deleting..."
                                : hasUnsavedChanges
                                    ? "Unsaved changes"
                                    : "Ready"}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <span>
                        Ln 1, Col 1
                    </span>

                    <span>UTF-8</span>

                    <span>
                        {getLanguageFromFileName(
                            selectedFile?.name ??
                            "",
                        )}
                    </span>
                </div>
            </footer>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    data-context-menu
                    className="fixed z-[60] w-44 rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-2xl"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y,
                    }}
                    onMouseDown={(event) =>
                        event.stopPropagation()
                    }
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >
                    {contextMenu.fileId && (
                        <>
                            <div className="my-1 border-t border-zinc-800" />

                            <button
                                type="button"
                                onClick={
                                    handleRename
                                }
                                disabled={
                                    updateFileMutation.isPending ||
                                    deleteFileMutation.isPending
                                }
                                className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className="mr-2">
                                    ✏
                                </span>

                                Rename
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!contextMenu?.fileId) {
                                        return;
                                    }

                                    setDialog({
                                        type: "move",
                                        fileId: contextMenu.fileId,
                                    });

                                    setContextMenu(null);
                                }}
                                disabled={
                                    updateFileMutation.isPending ||
                                    deleteFileMutation.isPending
                                }
                                className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className="mr-2">
                                    ↗
                                </span>

                                Move to...
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    updateFileMutation.isPending ||
                                    deleteFileMutation.isPending
                                }
                                className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-red-400 transition hover:bg-zinc-800 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className="mr-2">
                                    🗑
                                </span>

                                Delete
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() =>
                            openCreateDialog(
                                "file",
                                contextMenu.parentId,
                            )
                        }
                        className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                    >
                        <span className="mr-2">
                            📄
                        </span>

                        New File
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            openCreateDialog(
                                "folder",
                                contextMenu.parentId,
                            )
                        }
                        className="flex w-full items-center rounded-md px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                    >
                        <span className="mr-2">
                            📁
                        </span>

                        New Folder
                    </button>
                </div>
            )}

            {/* Create Dialog */}
            {newItemType && (
                <CreateItemDialog
                    type={newItemType}
                    name={newItemName}
                    error={createError}
                    locationName={getCreationLocationName()}
                    isCreating={isCreating}
                    onNameChange={
                        setNewItemName
                    }
                    onCreate={
                        handleCreate
                    }
                    onClose={
                        closeCreateDialog
                    }
                />
            )}

            {/*Confirm delete or rename dialog */}
            {dialog && (() => {
                const file = files.find(
                    (item) => item.id === dialog.fileId,
                );

                if (!file) {
                    return null;
                }

                return (
                    <WorkspaceDialog
                        type={dialog.type}
                        itemName={file.name}
                        itemType={file.type}
                        itemId={file.id}
                        currentParentId={file.parentId}
                        folders={files.filter(
                            (item) => item.type === "folder",
                        )}
                        onCancel={() => setDialog(null)}
                        onConfirm={handleDialogConfirm}
                        isLoading={
                            dialog.type === "rename" ||
                                dialog.type === "move"
                                ? updateFileMutation.isPending
                                : deleteFileMutation.isPending
                        }
                    />
                );
            })()}
        </main>
    );
}