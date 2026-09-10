import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    index,
    pgEnum,
    unique,
} from "drizzle-orm/pg-core";

import { projects } from "./projects.js";

export const fileTypeEnum = pgEnum("file_type", [
    "file",
    "folder",
]);

export const projectFiles = pgTable("project_files", {
    id: uuid("id")
        .defaultRandom()
        .primaryKey(),

    projectId: uuid("project_id")
        .notNull()
        .references(() => projects.id, {
            onDelete: "cascade",
        }),

    parentId: uuid("parent_id"),

    name: varchar("name", {
        length: 255,
    }).notNull(),

    type: fileTypeEnum("type").notNull(),

    content: text("content"),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
},

    (table) => [
        index("project_files_project_id_idx")
            .on(table.projectId),

        index("project_files_parent_id_idx")
            .on(table.parentId),

        unique("project_files_project_parent_name_unique")
            .on(
                table.projectId,
                table.parentId,
                table.name,
            )
            .nullsNotDistinct(),
    ],
);