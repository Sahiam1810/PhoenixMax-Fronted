import type { ApiResponse, Producto } from "../types"
import { request } from "./http"
export interface ProductosFiltro {
    plataforma?: string
    tipo?: string
}

function parametros(filtro: ProductosFiltro) {
    const search = new URLSearchParams()
    if (filtro.plataforma) search.set("plataforma", filtro.plataforma)
    if (filtro.tipo) search.set("tipo", filtro.tipo)
    return search.toString()
}

export const productosService = {
    listar: (filtro: ProductosFiltro = {}): Promise<ApiResponse<Producto[]>> => request(`/productos?${parametros(filtro)}`),
    obtener: (id: string): Promise<ApiResponse<Producto>> => request(`/productos/${id}`)
}
