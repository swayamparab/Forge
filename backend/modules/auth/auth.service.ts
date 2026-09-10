import { eq, or } from "drizzle-orm";

import { db } from "../../db/index.js";
import { users } from "../../db/schema/index.js";

import { hashPassword, verifyPassword } from "../../lib/auth/password.js";
import { createAccessToken } from "../../lib/auth/jwt.js";

interface SignupInput {
    username: string;
    email: string;
    password: string;
}

export async function signupUser(input: SignupInput) {
    const username = input.username.toLowerCase();
    const email = input.email.toLowerCase();

    const [existingUser] = await db
        .select({
            username: users.username,
            email: users.email,
        })
        .from(users)
        .where(
            or(
                eq(users.username, username),
                eq(users.email, email),
            ),
        )
        .limit(1);

    if (existingUser) {
        if (existingUser.username === username) {
            throw new Error("USERNAME_EXISTS");
        }

        if (existingUser.email === email) {
            throw new Error("EMAIL_EXISTS");
        }
    }

    const passwordHash = await hashPassword(input.password);

    const [newUser] = await db
        .insert(users)
        .values({
            username,
            email,
            passwordHash,
        })
        .returning({
            id: users.id,
            username: users.username,
            email: users.email,
            createdAt: users.createdAt,
        });

    if (!newUser) {
        throw new Error("USER_CREATION_FAILED");
    }

    const token = createAccessToken(newUser.id);

    return {
        user: newUser,
        token,
    };
}

interface LoginInput {
    identifier: string;
    password: string;
}

export async function loginUser(input: LoginInput) {
    const identifier = input.identifier.toLowerCase();

    const [user] = await db
        .select({
            id: users.id,
            username: users.username,
            email: users.email,
            passwordHash: users.passwordHash,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(
            or(
                eq(users.email, identifier),
                eq(users.username, identifier),
            ),
        )
        .limit(1);

    if (!user) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const passwordValid = await verifyPassword(
        input.password,
        user.passwordHash,
    );

    if (!passwordValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const token = createAccessToken(user.id);

    return {
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
        },
        token,
    };
}

export async function getCurrentUser(userId: string) {
    const [user] = await db
        .select({
            id: users.id,
            username: users.username,
            email: users.email,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return user;
}