import type { ApiResponse, Paginado, Producto, ProductosFiltro } from "../types"
import { productosMock } from "../mocks/servicios/productosMock"
import { aProducto, lista, type ProductoDto } from "./api/adaptadores"
import { plataformasConocidas } from "./api/plataformasConocidas"
import { query, request } from "./http"
import { elegir } from "./modo"

export interface ProductosService {
    listar: (filtro?: ProductosFiltro) => Promise<ApiResponse<Producto[]>>
    obtener: (id: number) => Promise<ApiResponse<Producto>>
}

const productosApi: ProductosService = {
    listar: async (filtro = {}) => {
        const [respuesta, plataformas] = await Promise.all([
            request<ProductoDto[] | Paginado<ProductoDto>>(`/productos${query({ plataforma: filtro.plataforma, tipo: filtro.tipo, limit: 100 })}`),
            plataformasConocidas()
        ])
        const productos = lista(respuesta.data)
            .map((item) => aProducto(item, plataformas))
            .filter((item) => !filtro.categoria || item.plataforma.categoria === filtro.categoria)
        return { message: respuesta.message, data: productos }
    },
    obtener: async (id) => {
        const [respuesta, plataformas] = await Promise.all([request<ProductoDto>(`/productos/${id}`), plataformasConocidas()])
        return { message: respuesta.message, data: aProducto(respuesta.data, plataformas) }
    }
}

export const productosService: ProductosService = elegir(productosMock, productosApi)
