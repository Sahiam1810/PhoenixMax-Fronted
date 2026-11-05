import type { ApiResponse, Compra } from "../types"
import { comprasMock } from "../mocks/servicios/comprasMock"
import { cuerpo, request, usarMocks } from "./http"

export interface ComprasService {
    crear: () => Promise<ApiResponse<Compra>>
    pagar: (id: number, metodoPago: string) => Promise<ApiResponse<Compra>>
    mias: () => Promise<ApiResponse<Compra[]>>
    obtener: (id: number) => Promise<ApiResponse<Compra>>
}

const comprasApi: ComprasService = {
    crear: () => request("/compras", { method: "POST" }),
    pagar: (id, metodoPago) => request(`/compras/${id}/pagar`, { method: "POST", ...cuerpo({ metodoPago }) }),
    mias: () => request("/compras/mias"),
    obtener: (id) => request(`/compras/${id}`)
}

export const comprasService: ComprasService = usarMocks ? comprasMock : comprasApi
