import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),

    username: varchar("username", { length: 30 }).notNull(),

    email: varchar("email", { length: 255 }).notNull(),

    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

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
        uniqueIndex("users_username_unique").on(table.username),
        uniqueIndex("users_email_unique").on(table.email),
    ],
);