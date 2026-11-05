import { Navigate, Route, Routes } from "react-router-dom"
import { AdminLayout } from "../components/admin"
import { Layout } from "../components/Layout"
import { ProtectedRoute } from "../components/ProtectedRoute"
import { Carrito } from "../pages/Carrito"
import { Catalogo } from "../pages/Catalogo"
import { Checkout } from "../pages/Checkout"
import { DetalleProducto } from "../pages/DetalleProducto"
import { Landing } from "../pages/Landing"
import { Login } from "../pages/Login"
import { NoEncontrado } from "../pages/NoEncontrado"
import { Perfil } from "../pages/Perfil"
import { Registro } from "../pages/Registro"
import { Inventario } from "../pages/admin/Inventario"
import { Plataformas } from "../pages/admin/Plataformas"
import { Productos } from "../pages/admin/Productos"
import { Resumen } from "../pages/admin/Resumen"
import { Usuarios } from "../pages/admin/Usuarios"
import { Ventas } from "../pages/admin/Ventas"

export function AppRouter() {
    return (
        <Routes>
            <Route path="login" element={<Login />} />
            <Route path="registro" element={<Registro />} />
            <Route element={<Layout />}>
                <Route index element={<Landing />} />
                <Route path="catalogo" element={<Catalogo />} />
                <Route path="producto/:id" element={<DetalleProducto />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="perfil" element={<Perfil />} />
                    <Route path="mi-cuenta" element={<Navigate to="/perfil" replace />} />
                </Route>
                <Route element={<ProtectedRoute rol="cliente" />}>
                    <Route path="carrito" element={<Carrito />} />
                    <Route path="checkout" element={<Checkout />} />
                </Route>
                <Route element={<ProtectedRoute rol="admin" />}>
                    <Route path="admin" element={<AdminLayout />}>
                        <Route index element={<Resumen />} />
                        <Route path="inventario" element={<Inventario />} />
                        <Route path="usuarios" element={<Usuarios />} />
                        <Route path="productos" element={<Productos />} />
                        <Route path="plataformas" element={<Plataformas />} />
                        <Route path="ventas" element={<Ventas />} />
                    </Route>
                </Route>
                <Route path="*" element={<NoEncontrado />} />
            </Route>
        </Routes>
    )
}
