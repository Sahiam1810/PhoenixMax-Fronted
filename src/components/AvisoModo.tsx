import { useEffect, useState } from "react"
import { apiDisponible, modoActual, modoForzado } from "../services/modo"

export function AvisoModo() {
    const [disponible, setDisponible] = useState(apiDisponible)
    const forzado = modoForzado()

    useEffect(() => {
        const actualizar = () => setDisponible(apiDisponible())
        window.addEventListener("phoenixmax:estado-servicio", actualizar)
        return () => window.removeEventListener("phoenixmax:estado-servicio", actualizar)
    }, [])

    if (modoActual() !== "mock" && disponible !== false) return null
    return (
        <div
            role="status"
            title={forzado ? "VITE_USE_MOCK=true" : "No se pudo conectar con la API"}
            className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10 sm:bottom-6 sm:left-6"
        >
            <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
            </span>
            {forzado ? "Modo datos de prueba" : "Servicio no disponible · verifica que la API esté encendida"}
        </div>
    )
}
