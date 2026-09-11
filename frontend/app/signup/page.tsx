"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { signup } from "@/services/auth";

export default function SignupPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
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
            await signup({
                username,
                email,
                password,
            });

            window.location.href = "/dashboard";
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create account",
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
                            Create your account
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Start building with Mesh.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="username"
                                className="mb-1.5 block text-sm font-medium text-zinc-300"
                            >
                                Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(event) =>
                                    setUsername(
                                        event.target.value,
                                    )
                                }
                                required
                                minLength={3}
                                maxLength={30}
                                autoComplete="username"
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                                placeholder="swayam"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-medium text-zinc-300"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value,
                                    )
                                }
                                required
                                autoComplete="email"
                                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm outline-none transition focus:border-zinc-500"
                                placeholder="you@example.com"
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
                                minLength={8}
                                maxLength={128}
                                autoComplete="new-password"
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
                                ? "Creating account..."
                                : "Create account"}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-zinc-800 pt-5 text-center text-sm text-zinc-500">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-zinc-200 hover:underline"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}