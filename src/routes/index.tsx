import { Route, Routes } from "react-router-dom"
import { Layout } from "../components/Layout"
import { ProtectedRoute } from "../components/ProtectedRoute"
import { Carrito } from "../pages/Carrito"
import { Catalogo } from "../pages/Catalogo"
import { Checkout } from "../pages/Checkout"
import { DetalleProducto } from "../pages/DetalleProducto"
import { Landing } from "../pages/Landing"
import { Login } from "../pages/Login"
import { MiCuenta } from "../pages/MiCuenta"
import { Registro } from "../pages/Registro"
import { Inventario } from "../pages/admin/Inventario"
import { Plataformas } from "../pages/admin/Plataformas"
import { Productos } from "../pages/admin/Productos"
import { Resumen } from "../pages/admin/Resumen"
import { Ventas } from "../pages/admin/Ventas"

export function AppRouter() {
    return <Routes><Route element={<Layout />}><Route index element={<Landing />} /><Route path="catalogo" element={<Catalogo />} /><Route path="producto/:id" element={<DetalleProducto />} /><Route path="login" element={<Login />} /><Route path="registro" element={<Registro />} /><Route element={<ProtectedRoute />}><Route path="carrito" element={<Carrito />} /><Route path="checkout" element={<Checkout />} /><Route path="mi-cuenta" element={<MiCuenta />} /></Route><Route element={<ProtectedRoute role="admin" />}><Route path="admin"><Route index element={<Resumen />} /><Route path="plataformas" element={<Plataformas />} /><Route path="productos" element={<Productos />} /><Route path="inventario" element={<Inventario />} /><Route path="ventas" element={<Ventas />} /></Route></Route></Route></Routes>
}
