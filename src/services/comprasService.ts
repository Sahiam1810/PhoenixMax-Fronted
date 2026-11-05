import type { ApiResponse, Compra, Paginado } from "../types"
import { comprasMock } from "../mocks/servicios/comprasMock"
import { aCompra, lista, type CompraDto } from "./api/adaptadores"
import { plataformasConocidas } from "./api/plataformasConocidas"
import { cuerpo, request } from "./http"
import { elegir } from "./modo"

export interface ComprasService {
    crear: () => Promise<ApiResponse<Compra>>
    pagar: (id: number, metodoPago: string) => Promise<ApiResponse<Compra>>
    mias: () => Promise<ApiResponse<Compra[]>>
    obtener: (id: number) => Promise<ApiResponse<Compra>>
}

async function compra(path: string, options: RequestInit = {}): Promise<ApiResponse<Compra>> {
    const [respuesta, plataformas] = await Promise.all([request<CompraDto>(path, options), plataformasConocidas()])
    return { message: respuesta.message, data: aCompra(respuesta.data, plataformas) }
}

const comprasApi: ComprasService = {
    crear: () => compra("/compras", { method: "POST" }),
    pagar: (id, metodoPago) => compra(`/compras/${id}/pagar`, { method: "POST", ...cuerpo({ metodoPago }) }),
    mias: async () => {
        const [respuesta, plataformas] = await Promise.all([request<CompraDto[] | Paginado<CompraDto>>("/compras/mias?page=1&limit=100"), plataformasConocidas()])
        return { message: respuesta.message, data: lista(respuesta.data).map((item) => aCompra(item, plataformas)) }
    },
    obtener: (id) => compra(`/compras/${id}`)
}

export const comprasService: ComprasService = elegir(comprasMock, comprasApi)
