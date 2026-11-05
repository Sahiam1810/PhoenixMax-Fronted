import type { ApiResponse, Compra, ComprasFiltro, Cuenta, CuentaInput, CuentasFiltro, Plataforma, PlataformaInput, Producto, ProductoInput, Resumen, Usuario, UsuarioInput, UsuariosFiltro } from "../types"
import { adminMock } from "../mocks/servicios/adminMock"
import { cuerpo, query, request, usarMocks } from "./http"

export interface ResultadoCron {
    enviados: number
    vencidos: number
}

export interface AdminService {
    cuentas: (filtro?: CuentasFiltro) => Promise<ApiResponse<Cuenta[]>>
    crearCuenta: (input: CuentaInput) => Promise<ApiResponse<Cuenta>>
    cambiarEstadoCuenta: (id: number, activa: boolean) => Promise<ApiResponse<Cuenta>>
    plataformas: () => Promise<ApiResponse<Plataforma[]>>
    crearPlataforma: (input: PlataformaInput) => Promise<ApiResponse<Plataforma>>
    actualizarPlataforma: (id: number, input: Partial<PlataformaInput>) => Promise<ApiResponse<Plataforma>>
    productos: () => Promise<ApiResponse<Producto[]>>
    crearProducto: (input: ProductoInput) => Promise<ApiResponse<Producto>>
    actualizarProducto: (id: number, input: Partial<ProductoInput>) => Promise<ApiResponse<Producto>>
    compras: (filtro?: ComprasFiltro) => Promise<ApiResponse<Compra[]>>
    resumen: () => Promise<ApiResponse<Resumen>>
    usuarios: (filtro?: UsuariosFiltro) => Promise<ApiResponse<Usuario[]>>
    crearUsuario: (input: UsuarioInput) => Promise<ApiResponse<Usuario>>
    cambiarEstadoUsuario: (id: number, activo: boolean) => Promise<ApiResponse<Usuario>>
    ejecutarCron: () => Promise<ApiResponse<ResultadoCron>>
}

const adminApi: AdminService = {
    cuentas: (filtro = {}) => request(`/admin/cuentas${query({ plataforma: filtro.plataforma, estado: filtro.estado })}`),
    crearCuenta: (input) => request("/admin/cuentas", { method: "POST", ...cuerpo(input) }),
    cambiarEstadoCuenta: (id, activa) => request(`/admin/cuentas/${id}`, { method: "PATCH", ...cuerpo({ activa }) }),
    plataformas: () => request("/admin/plataformas"),
    crearPlataforma: (input) => request("/admin/plataformas", { method: "POST", ...cuerpo(input) }),
    actualizarPlataforma: (id, input) => request(`/admin/plataformas/${id}`, { method: "PATCH", ...cuerpo(input) }),
    productos: () => request("/admin/productos"),
    crearProducto: (input) => request("/admin/productos", { method: "POST", ...cuerpo(input) }),
    actualizarProducto: (id, input) => request(`/admin/productos/${id}`, { method: "PATCH", ...cuerpo(input) }),
    compras: (filtro = {}) => request(`/admin/compras${query({ estado: filtro.estado, desde: filtro.desde, hasta: filtro.hasta })}`),
    resumen: () => request("/admin/resumen"),
    usuarios: (filtro = {}) => request(`/admin/usuarios${query({ rol: filtro.rol, activo: filtro.activo, q: filtro.busqueda })}`),
    crearUsuario: (input) => request("/admin/usuarios", { method: "POST", ...cuerpo(input) }),
    cambiarEstadoUsuario: (id, activo) => request(`/admin/usuarios/${id}`, { method: "PATCH", ...cuerpo({ activo }) }),
    ejecutarCron: () => request("/admin/cron/ejecutar", { method: "POST" })
}

export const adminService: AdminService = usarMocks ? adminMock : adminApi
