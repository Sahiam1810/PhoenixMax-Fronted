import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { setHttpToken } from "../services/http"
import type { Usuario } from "../types"

interface AuthContextValue {
    usuario: Usuario | null
    token: string | null
    login: (usuario: Usuario, token: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const value = useMemo(() => ({
        usuario,
        token,
        login: (nextUsuario: Usuario, nextToken: string) => {
            setUsuario(nextUsuario)
            setToken(nextToken)
            setHttpToken(nextToken)
        },
        logout: () => {
            setUsuario(null)
            setToken(null)
            setHttpToken(null)
        }
    }), [token, usuario])
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider")
    return context
}
