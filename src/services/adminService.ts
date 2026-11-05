import type { ApiResponse, Compra, ComprasFiltro, Cuenta, CuentaInput, CuentasFiltro, Plataforma, PlataformaInput, Producto, ProductoInput, Resumen, Usuario, UsuarioInput, UsuariosFiltro } from "../types"
import { adminMock } from "../mocks/servicios/adminMock"
import { aCompra, aCuenta, aPlataforma, aProducto, aUsuario, dinero, type CompraDto, type CuentaDto, type Dinero, type PlataformaDto, type ProductoDto, type UsuarioDto } from "./api/adaptadores"
import { olvidarPlataformas } from "./api/plataformasConocidas"
import { ApiError, cuerpo, request, todas } from "./http"
import { elegir } from "./modo"

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

interface ResumenDto {
    ventasHoy?: Dinero
    ventasMes?: Dinero
    comprasHoy?: number
    comprasMes?: number
    clientes?: number
    stock?: Array<{ plataforma: PlataformaDto, stockCuentas?: number, stockPantallas?: number }>
}

interface CronDto {
    notificacionesEnviadas?: number
    serviciosVencidos?: number
}

async function plataformasAdmin(): Promise<Plataforma[]> {
    const respuesta = await todas<PlataformaDto>("/admin/plataformas").catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 501) return todas<PlataformaDto>("/plataformas")
        throw error
    })
    return respuesta.data.map((item) => aPlataforma(item))
}

async function conPlataformas<T, R>(peticion: Promise<ApiResponse<T>>, convertir: (data: T, plataformas: Plataforma[]) => R): Promise<ApiResponse<R>> {
    const [respuesta, plataformas] = await Promise.all([peticion, plataformasAdmin().catch(() => [])])
    return { message: respuesta.message, data: convertir(respuesta.data, plataformas) }
}

function soloEstado<T extends { activo: boolean }>(input: Partial<T>) {
    const claves = Object.keys(input)
    return claves.length === 1 && claves[0] === "activo"
}

const adminApi: AdminService = {
    cuentas: (filtro = {}) => conPlataformas(
        todas<CuentaDto>("/admin/cuentas", { plataforma: filtro.plataforma, estado: filtro.estado }),
        (data, plataformas) => data.map((item) => aCuenta(item, plataformas))
    ),
    crearCuenta: (input) => conPlataformas(
        request<CuentaDto>("/admin/cuentas", { method: "POST", ...cuerpo(input) }),
        aCuenta
    ),
    cambiarEstadoCuenta: (id, activa) => conPlataformas(
        request<CuentaDto>(`/admin/cuentas/${id}/estado`, { method: "PATCH", ...cuerpo({ estado: activa ? "disponible" : "inactiva" }) }),
        aCuenta
    ),
    plataformas: async () => ({ message: "Plataformas obtenidas", data: await plataformasAdmin() }),
    crearPlataforma: async (input) => {
        const respuesta = await request<PlataformaDto>("/admin/plataformas", { method: "POST", ...cuerpo({ ...input, logoUrl: input.logoUrl || null }) })
        olvidarPlataformas()
        return { message: respuesta.message, data: aPlataforma(respuesta.data) }
    },
    actualizarPlataforma: async (id, input) => {
        const respuesta = soloEstado(input)
            ? await request<PlataformaDto>(`/admin/plataformas/${id}/estado`, { method: "PATCH", ...cuerpo(input) })
            : await request<PlataformaDto>(`/admin/plataformas/${id}`, { method: "PATCH", ...cuerpo(input) })
        olvidarPlataformas()
        return { message: respuesta.message, data: aPlataforma(respuesta.data) }
    },
    productos: () => conPlataformas(
        todas<ProductoDto>("/admin/productos"),
        (data, plataformas) => data.map((item) => aProducto(item, plataformas))
    ),
    crearProducto: (input) => conPlataformas(
        request<ProductoDto>("/admin/productos", { method: "POST", ...cuerpo(input) }),
        aProducto
    ),
    actualizarProducto: (id, input) => conPlataformas(
        soloEstado(input)
            ? request<ProductoDto>(`/admin/productos/${id}/estado`, { method: "PATCH", ...cuerpo(input) })
            : request<ProductoDto>(`/admin/productos/${id}`, { method: "PATCH", ...cuerpo(input) }),
        aProducto
    ),
    compras: (filtro = {}) => conPlataformas(
        todas<CompraDto>("/admin/compras", { estado: filtro.estado, desde: filtro.desde, hasta: filtro.hasta }),
        (data, plataformas) => data.map((item) => aCompra(item, plataformas))
    ),
    resumen: () => conPlataformas(
        request<ResumenDto>("/admin/resumen"),
        (data, plataformas) => ({
            ventasHoy: dinero(data.ventasHoy),
            ventasMes: dinero(data.ventasMes),
            comprasHoy: data.comprasHoy ?? 0,
            comprasMes: data.comprasMes ?? 0,
            clientes: data.clientes ?? 0,
            stock: (data.stock ?? []).map((fila) => ({
                plataforma: aPlataforma(fila.plataforma, plataformas),
                stockCuentas: fila.stockCuentas ?? 0,
                stockPantallas: fila.stockPantallas ?? 0
            }))
        })
    ),
    usuarios: async (filtro = {}) => {
        const respuesta = await todas<UsuarioDto>("/admin/usuarios", { rol: filtro.rol, activo: filtro.activo, q: filtro.busqueda })
        return { message: respuesta.message, data: respuesta.data.map(aUsuario) }
    },
    crearUsuario: async (input) => {
        const respuesta = await request<UsuarioDto>("/admin/usuarios", { method: "POST", ...cuerpo(input) })
        return { message: respuesta.message, data: aUsuario(respuesta.data) }
    },
    cambiarEstadoUsuario: async (id, activo) => {
        const respuesta = await request<UsuarioDto>(`/admin/usuarios/${id}/estado`, { method: "PATCH", ...cuerpo({ activo }) })
        return { message: respuesta.message, data: aUsuario(respuesta.data) }
    },
    ejecutarCron: async () => {
        const respuesta = await request<CronDto>("/admin/cron/ejecutar", { method: "POST" })
        return { message: respuesta.message, data: { enviados: respuesta.data.notificacionesEnviadas ?? 0, vencidos: respuesta.data.serviciosVencidos ?? 0 } }
    }
}

export const adminService: AdminService = elegir(adminMock, adminApi)
