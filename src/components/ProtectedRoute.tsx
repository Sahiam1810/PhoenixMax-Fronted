import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import type { Role } from "../types"
export function ProtectedRoute({ role }: { role?: Role }) {
    const { usuario } = useAuth()
    if (!usuario) return <Navigate to="/login" replace />
    if (role && usuario.rol !== role) return <Navigate to="/" replace />
    return <Outlet />
}
