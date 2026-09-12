"use client";

import { useParams } from "next/navigation";

import Workspace from "@/components/workspace/Workspace";

export default function ProjectWorkspacePage() {
    const params = useParams();

    const projectId =
        params.projectId as string;

    return (
        <Workspace
            projectId={projectId}
        />
    );
}