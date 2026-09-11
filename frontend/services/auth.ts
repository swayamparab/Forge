import api from "@/lib/api";

export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: string;
}

interface AuthResponse {
    success: boolean;
    user: User;
}

export async function signup(data: {
    username: string;
    email: string;
    password: string;
}) {
    const response = await api.post<AuthResponse>("/api/auth/signup",
        data
    );

    return response.data;
}

export async function login(data: {
    identifier: string;
    password: string;
}) {
    const response = await api.post<AuthResponse>("/api/auth/login",
        data
    );

    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get<AuthResponse>("/api/auth/me");

    return response.data;
}

export async function logout() {
    const response = await api.post<{
        success: boolean;
        message: string;
    }>("/api/auth/logout");

    return response.data;
}