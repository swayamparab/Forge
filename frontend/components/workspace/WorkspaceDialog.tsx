"use client";

import { useEffect, useState } from "react";

interface WorkspaceDialogProps {
    type: "rename" | "delete";
    itemName: string;
    itemType: "file" | "folder";
    onCancel: () => void;
    onConfirm: (value?: string) => void;
    isLoading?: boolean;
}

export default function WorkspaceDialog({
    type,
    itemName,
    itemType,
    onCancel,
    onConfirm,
    isLoading = false,
}: WorkspaceDialogProps) {
    const [name, setName] = useState(itemName);

    useEffect(() => {
        setName(itemName);
    }, [itemName]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onCancel();
            }

            if (
                event.key === "Enter" &&
                !event.shiftKey &&
                type === "rename"
            ) {
                event.preventDefault();

                if (name.trim()) {
                    onConfirm(name.trim());
                }
            }
        }

        document.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [name, onCancel, onConfirm, type]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onCancel();
                }
            }}
        >
            <div
                className="w-full max-w-md overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="border-b border-zinc-800 px-4 py-3">
                    <h2 className="text-sm font-medium text-zinc-100">
                        {type === "rename"
                            ? `Rename ${itemType}`
                            : `Delete ${itemType}`}
                    </h2>
                </div>

                <div className="px-4 py-4">
                    {type === "rename" ? (
                        <>
                            <p className="mb-3 text-sm text-zinc-400">
                                Enter a new name for{" "}
                                <span className="text-zinc-200">
                                    "{itemName}"
                                </span>
                                .
                            </p>

                            <input
                                autoFocus
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value,
                                    )
                                }
                                disabled={isLoading}
                                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                                placeholder="Enter a name"
                            />
                        </>
                    ) : (
                        <p className="text-sm leading-6 text-zinc-400">
                            Delete{" "}
                            <span className="font-medium text-zinc-200">
                                "{itemName}"
                            </span>
                            ?
                            <br />
                            <span className="text-zinc-500">
                                {itemType === "folder"
                                    ? "This will permanently delete the folder and everything inside it."
                                    : "This action cannot be undone."}
                            </span>
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-zinc-800 px-4 py-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (type === "rename") {
                                if (!name.trim()) {
                                    return;
                                }

                                onConfirm(name.trim());
                            } else {
                                onConfirm();
                            }
                        }}
                        disabled={
                            isLoading ||
                            (type === "rename" &&
                                !name.trim())
                        }
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${type === "delete"
                                ? "bg-red-600 text-white hover:bg-red-500"
                                : "bg-zinc-100 text-zinc-900 hover:bg-white"
                            }`}
                    >
                        {isLoading
                            ? type === "delete"
                                ? "Deleting..."
                                : "Renaming..."
                            : type === "delete"
                                ? "Delete"
                                : "Rename"}
                    </button>
                </div>
            </div>
        </div>
    );
}