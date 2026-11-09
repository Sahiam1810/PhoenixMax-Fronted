export type Modo = "api" | "mock"

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"
const forzado = import.meta.env.VITE_USE_MOCK === "true"
const INTERVALO = 8000
const ESPERA = 1500

let modo: Modo = forzado ? "mock" : "api"
let servicioDisponible: boolean | null = null
let revisando = false

export function modoActual(): Modo {
    return modo
}

export function modoForzado() {
    return forzado
}

export function apiDisponible() {
    return servicioDisponible
}

function actualizarDisponibilidad(disponible: boolean) {
    if (servicioDisponible === disponible) return
    servicioDisponible = disponible
    window.dispatchEvent(new Event("phoenixmax:estado-servicio"))
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
    actualizarDisponibilidad(await backendDisponible())
    return modo
}

export async function revisarModo() {
    if (forzado || revisando) return
    revisando = true
    try {
        actualizarDisponibilidad(await backendDisponible())
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
