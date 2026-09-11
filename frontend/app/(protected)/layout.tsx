"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "@/services/auth";

interface ProtectedLayoutProps {
    children: ReactNode;
}

export default function ProtectedLayout({
    children,
}: ProtectedLayoutProps) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        async function verifyAuthentication() {
            try {
                await getCurrentUser();
                setAuthenticated(true);
            } catch {
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        }

        verifyAuthentication();
    }, [router]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
                Loading Mesh...
            </main>
        );
    }

    if (!authenticated) {
        return null;
    }

    return <>{children}</>;
}