import type { ApiResponse, Producto, ProductosFiltro } from "../types"
import { productosMock } from "../mocks/servicios/productosMock"
import { query, request, usarMocks } from "./http"

export interface ProductosService {
    listar: (filtro?: ProductosFiltro) => Promise<ApiResponse<Producto[]>>
    obtener: (id: number) => Promise<ApiResponse<Producto>>
}

const productosApi: ProductosService = {
    listar: (filtro = {}) => request(`/productos${query({ plataforma: filtro.plataforma, tipo: filtro.tipo, categoria: filtro.categoria })}`),
    obtener: (id) => request(`/productos/${id}`)
}

export const productosService: ProductosService = usarMocks ? productosMock : productosApi
