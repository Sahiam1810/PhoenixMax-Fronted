import { modoActual, modoForzado } from "../services/modo"

export function AvisoModo() {
    if (modoActual() !== "mock") return null
    const forzado = modoForzado()
    return (
        <div
            role="status"
            title={forzado ? "VITE_USE_MOCKS=true" : "Se conectará solo cuando el servidor encienda"}
            className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-ink px-3.5 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10 sm:bottom-6 sm:left-6"
        >
            <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
            </span>
            {forzado ? "Modo datos de prueba" : "Backend apagado · datos de prueba"}
        </div>
    )
}
