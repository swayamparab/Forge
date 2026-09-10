import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const projects = pgTable("projects", {
    id: uuid("id").defaultRandom().primaryKey(),

    ownerId: uuid("owner_id")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade",
        }),

    name: varchar("name", { length: 100 }).notNull(),

    description: text("description"),

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
        index("projects_owner_id_idx").on(table.ownerId),
    ],
);