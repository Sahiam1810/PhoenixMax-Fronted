import type { ApiResponse, Compra } from "../types"
import { request } from "./http"
export const comprasService = {
    crear: (): Promise<ApiResponse<Compra>> => request("/compras", { method: "POST" }),
    pagar: (id: string): Promise<ApiResponse<Compra>> => request(`/compras/${id}/pagar`, { method: "POST" }),
    mias: (): Promise<ApiResponse<Compra[]>> => request("/compras/mias"),
    obtener: (id: string): Promise<ApiResponse<Compra>> => request(`/compras/${id}`)
}
