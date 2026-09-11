"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProjectWorkspacePage() {
    const params = useParams();

    const projectId = params.projectId as string;

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

                    <div className="p-3">
                        <div className="rounded-md px-2 py-1.5 text-xs text-zinc-500">
                            No files yet
                        </div>
                    </div>
                </aside>

                {/* Main Editor Area */}
                <section className="flex min-w-0 flex-1 flex-col">
                    {/* Tabs */}
                    <div className="flex h-10 shrink-0 items-center border-b border-zinc-800 bg-zinc-900/30">
                        <div className="flex h-full items-center border-r border-zinc-800 bg-zinc-950 px-4">
                            <span className="text-xs text-zinc-300">
                                Welcome
                            </span>

                            <button
                                className="ml-3 text-zinc-600 transition hover:text-zinc-300"
                                aria-label="Close tab"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex min-h-0 flex-1 items-center justify-center bg-zinc-950">
                        <div className="text-center">
                            <h1 className="text-sm font-medium text-zinc-400">
                                Forge Workspace
                            </h1>

                            <p className="mt-2 text-xs text-zinc-600">
                                Select a file from the Explorer
                                to start editing.
                            </p>
                        </div>
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