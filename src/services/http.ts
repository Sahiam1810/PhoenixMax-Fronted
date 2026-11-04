import type { ApiError, ApiResponse } from "../types"

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"

let accessToken: string | null = null

export function setHttpToken(token: string | null) {
    accessToken = token
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers)
    headers.set("Content-Type", "application/json")
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`)
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers })
    const payload = await response.json() as ApiResponse<T> | ApiError
    if (!response.ok) throw new Error("error" in payload ? payload.error : "Error de solicitud")
    return payload as ApiResponse<T>
}
