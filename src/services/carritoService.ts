import type { ApiResponse, Carrito } from "../types"
import { carritoMock } from "../mocks/servicios/carritoMock"
import { cuerpo, request, usarMocks } from "./http"

export interface CarritoService {
    obtener: () => Promise<ApiResponse<Carrito>>
    agregar: (productoId: number, cantidad: number) => Promise<ApiResponse<Carrito>>
    actualizar: (itemId: number, cantidad: number) => Promise<ApiResponse<Carrito>>
    eliminar: (itemId: number) => Promise<ApiResponse<Carrito>>
    vaciar: () => Promise<ApiResponse<Carrito>>
}

const obtener = () => request<Carrito>("/carrito")

const carritoApi: CarritoService = {
    obtener,
    agregar: async (productoId, cantidad) => {
        await request("/carrito", { method: "POST", ...cuerpo({ producto_id: productoId, cantidad }) })
        return obtener()
    },
    actualizar: async (itemId, cantidad) => {
        await request(`/carrito/${itemId}`, { method: "PATCH", ...cuerpo({ cantidad }) })
        return obtener()
    },
    eliminar: async (itemId) => {
        await request(`/carrito/${itemId}`, { method: "DELETE" })
        return obtener()
    },
    vaciar: async () => {
        await request("/carrito", { method: "DELETE" })
        return obtener()
    }
}

export const carritoService: CarritoService = usarMocks ? carritoMock : carritoApi
