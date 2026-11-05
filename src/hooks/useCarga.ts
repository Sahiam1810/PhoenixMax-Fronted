import { useCallback, useEffect, useState } from "react"
import { mensajeError } from "../services/http"
import type { ApiResponse } from "../types"

export function useCarga<T>(cargar: () => Promise<ApiResponse<T>>) {
    const [data, setData] = useState<T | null>(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState("")

    const recargar = useCallback(async () => {
        setCargando(true)
        setError("")
        try {
            const respuesta = await cargar()
            setData(respuesta.data)
        } catch (fallo) {
            setError(mensajeError(fallo))
        } finally {
            setCargando(false)
        }
    }, [cargar])

    useEffect(() => {
        recargar()
    }, [recargar])

    return { data, setData, cargando, error, recargar }
}
