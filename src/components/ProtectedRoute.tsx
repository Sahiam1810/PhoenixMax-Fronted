import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import type { Rol } from "../types"
import { Cargando } from "./ui"

export function ProtectedRoute({ rol }: { rol?: Rol }) {
    const { usuario, verificando } = useAuth()
    const location = useLocation()
    if (verificando) return <Cargando texto="Verificando sesión..." />
    if (!usuario) return <Navigate to="/login" replace state={{ desde: `${location.pathname}${location.search}` }} />
    if (rol && usuario.rol !== rol) return <Navigate to={usuario.rol === "admin" ? "/admin" : "/"} replace />
    return <Outlet />
}
