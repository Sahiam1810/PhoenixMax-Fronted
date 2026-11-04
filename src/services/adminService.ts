import type { ApiResponse, Compra, Plataforma, Producto } from "../types"
import { request } from "./http"
export const adminService = {
    listarCuentas: (): Promise<ApiResponse<unknown[]>> => request("/admin/cuentas"),
    crearCuenta: (input: Record<string, unknown>): Promise<ApiResponse<unknown>> => request("/admin/cuentas", { method: "POST", body: JSON.stringify(input) }),
    listarPlataformas: (): Promise<ApiResponse<Plataforma[]>> => request("/admin/plataformas"),
    crearPlataforma: (input: Partial<Plataforma>): Promise<ApiResponse<Plataforma>> => request("/admin/plataformas", { method: "POST", body: JSON.stringify(input) }),
    actualizarPlataforma: (id: string, input: Partial<Plataforma>): Promise<ApiResponse<Plataforma>> => request(`/admin/plataformas/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    eliminarPlataforma: (id: string): Promise<ApiResponse<null>> => request(`/admin/plataformas/${id}`, { method: "DELETE" }),
    listarProductos: (): Promise<ApiResponse<Producto[]>> => request("/admin/productos"),
    crearProducto: (input: Partial<Producto>): Promise<ApiResponse<Producto>> => request("/admin/productos", { method: "POST", body: JSON.stringify(input) }),
    actualizarProducto: (id: string, input: Partial<Producto>): Promise<ApiResponse<Producto>> => request(`/admin/productos/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
    eliminarProducto: (id: string): Promise<ApiResponse<null>> => request(`/admin/productos/${id}`, { method: "DELETE" }),
    compras: (): Promise<ApiResponse<Compra[]>> => request("/admin/compras"),
    resumen: (): Promise<ApiResponse<Record<string, unknown>>> => request("/admin/resumen"),
    ejecutarCron: (): Promise<ApiResponse<null>> => request("/admin/cron/ejecutar", { method: "POST" })
}
