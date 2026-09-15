import {
    pgTable,
    uuid,
    varchar,
    bigint,
    timestamp,
    index,
    unique,
} from "drizzle-orm/pg-core";

import { projects } from "./projects.js";

export const githubConnections = pgTable("github_connections",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        projectId: uuid("project_id")
            .notNull()
            .references(() => projects.id, {
                onDelete: "cascade",
            }),

        githubUserId: bigint(
            "github_user_id",
            {
                mode: "number",
            },
        ).notNull(),

        githubUsername: varchar(
            "github_username",
            {
                length: 255,
            },
        ).notNull(),

        installationId: bigint(
            "installation_id",
            {
                mode: "number",
            },
        ).notNull(),

        repositoryOwner: varchar(
            "repository_owner",
            {
                length: 255,
            },
        ).notNull(),

        repositoryName: varchar(
            "repository_name",
            {
                length: 255,
            },
        ).notNull(),

        repositoryUrl: varchar(
            "repository_url",
            {
                length: 500,
            },
        ).notNull(),

        accessToken: varchar(
            "access_token",
            {
                length: 4096,
            },
        ),

        refreshToken: varchar(
            "refresh_token",
            {
                length: 4096,
            },
        ),

        accessTokenExpiresAt:
            timestamp(
                "access_token_expires_at",
                {
                    withTimezone: true,
                },
            ),

        refreshTokenExpiresAt:
            timestamp(
                "refresh_token_expires_at",
                {
                    withTimezone: true,
                },
            ),

        createdAt: timestamp(
            "created_at",
            {
                withTimezone: true,
            },
        )
            .defaultNow()
            .notNull(),

        updatedAt: timestamp(
            "updated_at",
            {
                withTimezone: true,
            },
        )
            .defaultNow()
            .notNull(),
    },
    (table) => [
        unique(
            "github_connections_project_unique",
        ).on(table.projectId),

        index(
            "github_connections_installation_id_idx",
        ).on(table.installationId),

        index(
            "github_connections_github_user_id_idx",
        ).on(table.githubUserId),
    ],
);