"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

import { getCurrentUser, logout } from "@/services/auth";
import {
    createProject,
    getProjects,
    type Project,
} from "@/services/project";

export default function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [username, setUsername] = useState("");

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] =
        useState("");

    const [showCreateForm, setShowCreateForm] =
        useState(false);

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDashboard() {
            try {
                const [userResponse, projectsResponse] =
                    await Promise.all([
                        getCurrentUser(),
                        getProjects(),
                    ]);

                setUsername(userResponse.user.username);
                setProjects(projectsResponse.projects);
            } catch (error) {
                console.error(
                    "Failed to load dashboard:",
                    error,
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    async function handleCreateProject(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError("");

        if (!projectName.trim()) {
            setError("Project name is required");
            return;
        }

        setCreating(true);

        try {
            const response = await createProject({
                name: projectName.trim(),
                description:
                    projectDescription.trim() || undefined,
            });

            setProjects((currentProjects) => [
                response.project,
                ...currentProjects,
            ]);

            setProjectName("");
            setProjectDescription("");
            setShowCreateForm(false);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create project",
            );
        } finally {
            setCreating(false);
        }
    }

    async function handleLogout() {
        try {
            await logout();
        } finally {
            window.location.href = "/login";
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
                Loading Forge...
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100">
            <header className="border-b border-zinc-800">
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                    <Link
                        href="/dashboard"
                        className="text-lg font-semibold tracking-tight"
                    >
                        Forge
                    </Link>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-zinc-500">
                            {username}
                        </span>

                        <button
                            onClick={handleLogout}
                            className="text-sm text-zinc-500 transition hover:text-zinc-200"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Your Projects
                        </h1>

                        <p className="mt-1 text-sm text-zinc-500">
                            Create a project and start
                            building.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            setShowCreateForm(
                                (current) => !current,
                            )
                        }
                        className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white"
                    >
                        + New Project
                    </button>
                </div>

                {showCreateForm && (
                    <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
                        <h2 className="mb-5 font-medium">
                            Create project
                        </h2>

                        <form
                            onSubmit={handleCreateProject}
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="project-name"
                                    className="mb-1.5 block text-sm text-zinc-400"
                                >
                                    Name
                                </label>

                                <input
                                    id="project-name"
                                    value={projectName}
                                    onChange={(event) =>
                                        setProjectName(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="My project"
                                    maxLength={100}
                                    autoFocus
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-zinc-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="project-description"
                                    className="mb-1.5 block text-sm text-zinc-400"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="project-description"
                                    value={projectDescription}
                                    onChange={(event) =>
                                        setProjectDescription(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="What are you building?"
                                    maxLength={500}
                                    rows={3}
                                    className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-zinc-500"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-400">
                                    {error}
                                </p>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(
                                            false,
                                        );
                                        setError("");
                                    }}
                                    className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {creating
                                        ? "Creating..."
                                        : "Create project"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {projects.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-800 py-20 text-center">
                        <h2 className="font-medium text-zinc-300">
                            No projects yet
                        </h2>

                        <p className="mt-2 text-sm text-zinc-500">
                            Create your first project to get
                            started.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-700 hover:bg-zinc-900"
                            >
                                <h2 className="font-medium text-zinc-200 group-hover:text-white">
                                    {project.name}
                                </h2>

                                <p className="mt-2 min-h-10 text-sm text-zinc-500">
                                    {project.description ||
                                        "No description"}
                                </p>

                                <div className="mt-5 text-xs text-zinc-600">
                                    Updated{" "}
                                    {new Date(
                                        project.updatedAt,
                                    ).toLocaleDateString()}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}