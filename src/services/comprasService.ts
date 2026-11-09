import type { ApiResponse, Compra } from "../types"
import { aCompra, type CompraDto } from "./api/adaptadores"
import { plataformasConocidas } from "./api/plataformasConocidas"
import { cuerpo, request, todas } from "./http"

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
    pagar: (id) => compra(`/compras/${id}/pagar`, { method: "POST", ...cuerpo({ metodoPago: "simulado" }) }),
    mias: async () => {
        const [respuesta, plataformas] = await Promise.all([todas<CompraDto>("/compras/mias"), plataformasConocidas()])
        return { message: respuesta.message, data: respuesta.data.map((item) => aCompra(item, plataformas)) }
    },
    obtener: (id) => compra(`/compras/${id}`)
}

export const comprasService: ComprasService = comprasApi
