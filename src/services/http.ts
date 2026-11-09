import type { ApiErrorBody, ApiResponse, Paginado } from "../types"

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"

let leerToken: () => string | null = () => null
let alExpirar: () => void = () => undefined

export function registrarLectorToken(lector: () => string | null) {
    leerToken = lector
}

export function registrarSesionExpirada(accion: () => void) {
    alExpirar = accion
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

function esCuerpoError(valor: unknown): valor is ApiErrorBody {
    return typeof valor === "object" && valor !== null && "error" in valor && typeof valor.error === "string"
}

function mensajePorEstado(status: number) {
    if (status === 401) return "Tu sesión expiró, inicia sesión de nuevo"
    if (status === 403) return "No tienes permiso para hacer esto"
    if (status === 404) return "No encontramos lo que buscas"
    if (status === 501) return "Esta función aún no está disponible en el servidor"
    if (status >= 500) return "El servidor tuvo un problema, intenta de nuevo"
    return "No se pudo completar la solicitud"
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers)
    headers.set("Content-Type", "application/json")
    const token = leerToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
    let response: Response
    try {
        response = await fetch(`${baseUrl}${path}`, { ...options, headers })
    } catch {
        throw new ApiError("No se pudo conectar con el servidor. Revisa que el backend esté encendido.", 0)
    }
    const payload: unknown = await response.json().catch(() => null)
    if (!response.ok) {
        if (response.status === 401 && token) alExpirar()
        if (esCuerpoError(payload) && response.status !== 501) throw new ApiError(payload.error, response.status, payload.errors ?? {})
        throw new ApiError(mensajePorEstado(response.status), response.status)
    }
    return payload as ApiResponse<T>
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

const LIMITE_PAGINA = 50

export async function todas<T>(path: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<ApiResponse<T[]>> {
    const datos: T[] = []
    let pagina: number | null = 1
    let message = ""
    while (pagina !== null) {
        const respuesta: ApiResponse<T[] | Paginado<T>> = await request<T[] | Paginado<T>>(`${path}${query({ ...params, page: pagina, limit: LIMITE_PAGINA })}`)
        message = respuesta.message
        if (Array.isArray(respuesta.data)) return { message, data: respuesta.data }
        datos.push(...respuesta.data.data)
        pagina = respuesta.data.nextPage
    }
    return { message, data: datos }
}

export function mensajeError(error: unknown) {
    if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
        const detalle = Object.values(error.errors).flat().join(". ")
        return `${error.message}: ${detalle}`
    }
    if (error instanceof Error) return error.message
    return "Ocurrió un error inesperado"
}
