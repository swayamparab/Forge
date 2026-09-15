import type {
    Request,
    Response,
} from "express";

import {
    createGithubState,
    exchangeGithubCode,
    getGithubInstallUrl,
    getGithubInstallations,
    getGithubInstallationRepositories,
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

export async function githubCallbackController(
    req: Request,
    res: Response,
) {
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
         * Verify which GitHub App installations
         * this GitHub user can access.
         */
        const installations =
            await getGithubInstallations(
                token.access_token!,
            );

        /*
         * Fetch repositories accessible through
         * each installation.
         *
         * We do this from GitHub's API instead of
         * trusting repository information supplied
         * by the browser.
         */
        const installationsWithRepositories =
            await Promise.all(
                installations.installations.map(
                    async (installation) => {
                        const repositories =
                            await getGithubInstallationRepositories(
                                token.access_token!,
                                installation.id,
                            );

                        return {
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
                                installation
                                    .repository_selection,
                            repositories:
                                repositories
                                    .repositories
                                    .map(
                                        (repository) => ({
                                            id:
                                                repository.id,
                                            name:
                                                repository.name,
                                            fullName:
                                                repository.full_name,
                                            url:
                                                repository.html_url,
                                            private:
                                                repository.private,
                                            owner:
                                                repository
                                                    .owner
                                                    .login,
                                        }),
                                    ),
                        };
                    },
                ),
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
                installationsWithRepositories,
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