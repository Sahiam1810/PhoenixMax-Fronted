import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { authService } from "../services/authService"
import { ApiError, registrarLectorToken, registrarSesionExpirada } from "../services/http"
import type { Usuario } from "../types"

interface Sesion {
    usuario: Usuario
    token: string
}

interface AuthContextValue {
    usuario: Usuario | null
    token: string | null
    verificando: boolean
    iniciarSesion: (usuario: Usuario, token: string) => void
    actualizarUsuario: (usuario: Usuario) => void
    cerrarSesion: () => void
}

const CLAVE_SESION = "phoenixmax-sesion"

function leerSesion(): Sesion | null {
    try {
        const texto = localStorage.getItem(CLAVE_SESION)
        return texto ? JSON.parse(texto) as Sesion : null
    } catch {
        return null
    }
}

function escribirSesion(sesion: Sesion | null) {
    try {
        if (sesion) localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
        else localStorage.removeItem(CLAVE_SESION)
    } catch {
        return
    }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [sesion, setSesion] = useState<Sesion | null>(leerSesion)
    const [verificando, setVerificando] = useState(sesion !== null)
    const tokenRef = useRef<string | null>(sesion?.token ?? null)
    useState(() => registrarLectorToken(() => tokenRef.current))

    const guardar = useCallback((nueva: Sesion | null) => {
        tokenRef.current = nueva?.token ?? null
        escribirSesion(nueva)
        setSesion(nueva)
    }, [])

    useEffect(() => {
        registrarSesionExpirada(() => guardar(null))
    }, [guardar])

    useEffect(() => {
        if (!tokenRef.current) return
        const token = tokenRef.current
        authService.me()
            .then((respuesta) => guardar({ usuario: respuesta.data, token }))
            .catch((fallo: unknown) => {
                if (fallo instanceof ApiError && (fallo.status === 401 || fallo.status === 404)) guardar(null)
            })
            .finally(() => setVerificando(false))
    }, [guardar])

    const value = useMemo<AuthContextValue>(() => ({
        usuario: sesion?.usuario ?? null,
        token: sesion?.token ?? null,
        verificando,
        iniciarSesion: (usuario, token) => guardar({ usuario, token }),
        actualizarUsuario: (usuario) => {
            if (tokenRef.current) guardar({ usuario, token: tokenRef.current })
        },
        cerrarSesion: () => guardar(null)
    }), [guardar, sesion, verificando])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider")
    return context
}
