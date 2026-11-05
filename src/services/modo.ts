export type Modo = "api" | "mock"

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
const configurado = import.meta.env.VITE_USE_MOCKS
const forzado: Modo | null = configurado === "true" ? "mock" : configurado === "false" ? "api" : null
const INTERVALO = 8000
const ESPERA = 1500

let modo: Modo = forzado ?? "mock"
let revisando = false

export function modoActual(): Modo {
    return modo
}

export function modoForzado() {
    return forzado !== null
}

async function backendDisponible() {
    const control = new AbortController()
    const temporizador = setTimeout(() => control.abort(), ESPERA)
    try {
        const respuesta = await fetch(`${baseUrl}/health`, { signal: control.signal, cache: "no-store" })
        return respuesta.ok
    } catch {
        return false
    } finally {
        clearTimeout(temporizador)
    }
}

export async function detectarModo() {
    if (forzado) return modo
    modo = (await backendDisponible()) ? "api" : "mock"
    return modo
}

export async function revisarModo() {
    if (forzado || revisando) return
    revisando = true
    try {
        const siguiente: Modo = (await backendDisponible()) ? "api" : "mock"
        if (siguiente !== modo) window.location.reload()
    } finally {
        revisando = false
    }
}

export function vigilarModo() {
    if (forzado) return
    window.setInterval(() => {
        revisarModo()
    }, INTERVALO)
}

export function elegir<T extends object>(mock: T, api: T): T {
    return new Proxy(api, {
        get: (_objetivo, clave) => Reflect.get(modo === "mock" ? mock : api, clave) as unknown
    })
}
