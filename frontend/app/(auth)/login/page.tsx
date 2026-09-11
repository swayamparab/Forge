"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { login } from "@/services/auth";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login({
                identifier,
                password,
            });

            window.location.href = "/dashboard";
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to sign in",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Mesh
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500">
                        Build together. In real time.
                    </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold">
                            Welcome back
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Sign in to continue to Mesh.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="identifier"
                                className="mb-1.5 block text-sm font-medium text-zinc-300"
                            >
                                Username or email
                            </label>

                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(event) =>
                                    setIdentifier(
                                        event.target.value,
                                    )
                                }
                                required
                                autoComplete="username"
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                                placeholder="swayam or you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium text-zinc-300"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value,
                                    )
                                }
                                required
                                autoComplete="current-password"
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2.5 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-zinc-800 pt-5 text-center text-sm text-zinc-500">
                        Don't have an account?{" "}
                        <Link
                            href="/signup"
                            className="text-zinc-200 hover:underline"
                        >
                            Create one
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}