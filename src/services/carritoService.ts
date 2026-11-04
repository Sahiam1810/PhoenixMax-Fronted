import type { ApiResponse, CarritoItem } from "../types"
import { request } from "./http"
export interface CarritoInput {
    productoId: string
    cantidad: number
}
export const carritoService = {
    obtener: (): Promise<ApiResponse<CarritoItem[]>> => request("/carrito"),
    agregar: (input: CarritoInput): Promise<ApiResponse<CarritoItem>> => request("/carrito", { method: "POST", body: JSON.stringify(input) }),
    actualizar: (itemId: string, input: Partial<CarritoInput>): Promise<ApiResponse<CarritoItem>> => request(`/carrito/${itemId}`, { method: "PATCH", body: JSON.stringify(input) }),
    eliminar: (itemId: string): Promise<ApiResponse<null>> => request(`/carrito/${itemId}`, { method: "DELETE" }),
    vaciar: (): Promise<ApiResponse<null>> => request("/carrito", { method: "DELETE" })
}
