import type { ApiErrorBody, ApiResponse } from "../types"

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"

export const usarMocks = import.meta.env.VITE_USE_MOCKS !== "false"

let leerToken: () => string | null = () => null

export function registrarLectorToken(lector: () => string | null) {
    leerToken = lector
}

export function tokenActual() {
    return leerToken()
}

export class ApiError extends Error {
    status: number
    errors: Record<string, string[]>

    constructor(message: string, status = 400, errors: Record<string, string[]> = {}) {
        super(message)
        this.status = status
        this.errors = errors
    }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers)
    headers.set("Content-Type", "application/json")
    const token = leerToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
    const response = await fetch(`${baseUrl}${path}`, { ...options, headers })
    const payload = await response.json() as ApiResponse<T> | ApiErrorBody
    if (!response.ok || !payload.ok) {
        const errores = "errors" in payload ? payload.errors : undefined
        throw new ApiError(payload.message ?? "Error de solicitud", response.status, errores ?? {})
    }
    return payload
}

export function cuerpo(data: object): RequestInit {
    return { body: JSON.stringify(data) }
}

export function query(params: Record<string, string | number | boolean | undefined>) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== "") search.set(clave, String(valor))
    })
    const texto = search.toString()
    return texto ? `?${texto}` : ""
}

export function mensajeError(error: unknown) {
    if (error instanceof Error) return error.message
    return "Ocurrió un error inesperado"
}
