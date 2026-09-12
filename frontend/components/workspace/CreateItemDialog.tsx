"use client";

interface CreateItemDialogProps {
    type: "file" | "folder";
    name: string;
    error: string | null;
    locationName: string;
    isCreating: boolean;
    onNameChange: (name: string) => void;
    onCreate: () => void;
    onClose: () => void;
}

export default function CreateItemDialog({
    type,
    name,
    error,
    locationName,
    isCreating,
    onNameChange,
    onCreate,
    onClose,
}: CreateItemDialogProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
                <h2 className="text-sm font-semibold text-zinc-100">
                    {type === "file"
                        ? "Create File"
                        : "Create Folder"}
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                    Create in{" "}
                    <span className="text-zinc-300">
                        {locationName}
                    </span>
                    .
                </p>

                <input
                    autoFocus
                    value={name}
                    onChange={(event) =>
                        onNameChange(
                            event.target.value,
                        )
                    }
                    onKeyDown={(event) => {
                        if (
                            event.key ===
                            "Enter"
                        ) {
                            onCreate();
                        }

                        if (
                            event.key ===
                            "Escape"
                        ) {
                            onClose();
                        }
                    }}
                    placeholder={
                        type === "file"
                            ? "e.g. app.tsx"
                            : "e.g. components"
                    }
                    className="mt-4 h-9 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
                />

                {error && (
                    <p className="mt-2 text-xs text-red-400">
                        {error}
                    </p>
                )}

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isCreating}
                        className="rounded-md px-3 py-2 text-xs text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onCreate}
                        disabled={
                            isCreating ||
                            !name.trim()
                        }
                        className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isCreating
                            ? "Creating..."
                            : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}