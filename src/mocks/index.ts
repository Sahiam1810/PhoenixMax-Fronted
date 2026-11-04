import type { CarritoItem, Plataforma, Producto, Servicio } from "../types"

export const plataformasMock: Plataforma[] = [
    { id: "netflix", nombre: "Netflix", activa: true },
    { id: "disney", nombre: "Disney+", activa: true }
]

export const productosMock: Producto[] = [
    { id: "1", plataformaId: "netflix", plataforma: "Netflix", modalidad: "Pantalla", duracion: "30 días", precio: "12000.00", stock: 8, maxPantallas: 1 },
    { id: "2", plataformaId: "disney", plataforma: "Disney+", modalidad: "Cuenta", duracion: "30 días", precio: "15000.00", stock: 0, maxPantallas: 4 }
]

export const carritoMock: CarritoItem[] = [{ id: "item-1", productoId: "1", producto: productosMock[0], cantidad: 1 }]

export const serviciosMock: Servicio[] = [{ id: "servicio-1", productoId: "1", plataforma: "Netflix", fechaVencimiento: "2026-12-04", estado: "activo", credenciales: "usuario@ejemplo.com / demo123" }]
