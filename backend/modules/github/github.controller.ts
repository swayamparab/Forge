import type {
    Request,
    Response,
} from "express";

import {
    createGithubState,
    exchangeGithubCode,
    getGithubInstallUrl,
    getGithubInstallations,
    getGithubUser,
    verifyGithubState,
} from "./github.service.js";
import { getProjectById } from "../projects/project.service.js";

const STATE_COOKIE =
    "mesh_github_oauth_state";

export async function connectGithubController(
    req: Request,
    res: Response,
) {
    const userId = req.userId;

    const projectId =
        typeof req.query.projectId === "string"
            ? req.query.projectId
            : null;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized.",
        });
    }

    if (!projectId) {
        return res.status(400).json({
            success: false,
            message: "projectId is required.",
        });
    }

    const project = await getProjectById(
        projectId,
        userId,
    );

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found.",
        });
    }

    try {
        const { state, nonce } =
            createGithubState(
                userId,
                projectId,
            );

        res.cookie(
            STATE_COOKIE,
            nonce,
            {
                httpOnly: true,
                secure:
                    process.env.NODE_ENV ===
                    "production",
                sameSite: "lax",
                maxAge:
                    10 * 60 * 1000,
                path: "/",
            },
        );

        return res.json({
            success: true,
            authorizationUrl:
                getGithubInstallUrl(
                    state,
                ),
        });
    } catch (error) {
        console.error(
            "Failed to create GitHub authorization URL:",
            error,
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to start GitHub connection.",
        });
    }
}

export async function githubCallbackController(req: Request, res: Response,) {
    const {
        code,
        state,
        error,
        error_description,
    } = req.query;

    if (error) {
        return res.status(400).json({
            success: false,
            message:
                typeof error_description ===
                    "string"
                    ? error_description
                    : `GitHub authorization failed: ${String(error)}`,
        });
    }

    if (
        typeof code !== "string" ||
        typeof state !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Missing GitHub authorization parameters.",
        });
    }

    const stateCookie =
        req.cookies?.[
        STATE_COOKIE
        ];

    if (
        typeof stateCookie !==
        "string"
    ) {
        return res.status(400).json({
            success: false,
            message:
                "GitHub authorization session expired.",
        });
    }

    try {
        const statePayload =
            verifyGithubState(
                state,
            );

        /*
         * The nonce in the signed state must
         * match the HttpOnly cookie created
         * when the MeshIDE user started the flow.
         */
        if (
            statePayload.nonce !==
            stateCookie
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid GitHub authorization state.",
            });
        }

        const token =
            await exchangeGithubCode(
                code,
            );

        /*
         * Verify which GitHub account actually
         * authorized MeshIDE.
         */
        const githubUser =
            await getGithubUser(
                token.access_token!,
            );

        /*
         * Verify which MeshIDE GitHub App
         * installations this GitHub user can access.
         */
        const installations =
            await getGithubInstallations(
                token.access_token!,
            );

        res.clearCookie(
            STATE_COOKIE,
            {
                httpOnly: true,
                secure:
                    process.env
                        .NODE_ENV ===
                    "production",
                sameSite: "lax",
                path: "/",
            },
        );

        /*
         * We deliberately don't persist the token yet.
         *
         * The next milestone will introduce the
         * GitHub connection table and encrypted
         * credential storage.
         */
        return res.json({
            success: true,
            message:
                "GitHub authorization successful.",
            githubUser: {
                id: githubUser.id,
                login: githubUser.login,
                avatarUrl:
                    githubUser.avatar_url,
                profileUrl:
                    githubUser.html_url,
            },
            installations:
                installations.installations.map(
                    (installation) => ({
                        id:
                            installation.id,
                        account:
                            installation
                                .account
                                .login,
                        accountId:
                            installation
                                .account
                                .id,
                        accountType:
                            installation
                                .account
                                .type,
                        repositorySelection:
                            installation.repository_selection,
                    }),
                ),
            meshUserId:
                statePayload.userId,

            projectId:
                statePayload.projectId,
        });
    } catch (error) {
        console.error(
            "GitHub callback failed:",
            error,
        );

        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "GitHub authorization failed.",
        });
    }
}