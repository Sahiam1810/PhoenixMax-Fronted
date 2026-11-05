import type { ApiResponse, Carrito } from "../types"
import { carritoMock } from "../mocks/servicios/carritoMock"
import { aCarrito, type CarritoDto } from "./api/adaptadores"
import { plataformasConocidas } from "./api/plataformasConocidas"
import { cuerpo, request } from "./http"
import { elegir } from "./modo"

export interface CarritoService {
    obtener: () => Promise<ApiResponse<Carrito>>
    agregar: (productoId: number, cantidad: number) => Promise<ApiResponse<Carrito>>
    actualizar: (itemId: number, cantidad: number) => Promise<ApiResponse<Carrito>>
    eliminar: (itemId: number) => Promise<ApiResponse<Carrito>>
    vaciar: () => Promise<ApiResponse<Carrito>>
}

async function carrito(path: string, options: RequestInit = {}): Promise<ApiResponse<Carrito>> {
    const [respuesta, plataformas] = await Promise.all([request<CarritoDto>(path, options), plataformasConocidas()])
    return { message: respuesta.message, data: aCarrito(respuesta.data, plataformas) }
}

const carritoApi: CarritoService = {
    obtener: () => carrito("/carrito"),
    agregar: (productoId, cantidad) => carrito("/carrito", { method: "POST", ...cuerpo({ productoId, cantidad }) }),
    actualizar: (itemId, cantidad) => carrito(`/carrito/${itemId}`, { method: "PATCH", ...cuerpo({ cantidad }) }),
    eliminar: (itemId) => carrito(`/carrito/${itemId}`, { method: "DELETE" }),
    vaciar: () => carrito("/carrito", { method: "DELETE" })
}

export const carritoService: CarritoService = elegir(carritoMock, carritoApi)
