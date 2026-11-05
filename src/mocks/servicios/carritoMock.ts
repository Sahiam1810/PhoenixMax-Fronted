import type { CarritoService } from "../../services/carritoService"
import { carritoDe, db, fallo, nombreProducto, ok, productoPorId, siguienteId, stockDe, transaccion, usuarioSesion, type MockDb } from ".."

function validarCantidad(base: MockDb, productoId: number, cantidad: number) {
    if (!Number.isInteger(cantidad) || cantidad < 1) fallo("La cantidad debe ser al menos 1")
    const producto = productoPorId(base, productoId)
    const stock = stockDe(base, producto)
    if (stock === 0) fallo(`${nombreProducto(base, producto)} está agotado`, 409)
    if (cantidad > stock) fallo(`Solo ${stock === 1 ? "queda 1 unidad disponible" : `quedan ${stock} unidades disponibles`} de ${nombreProducto(base, producto)}`, 409)
}

function itemDelUsuario(base: MockDb, usuarioId: number, itemId: number) {
    const item = base.carrito.find((linea) => linea.id === itemId && linea.usuarioId === usuarioId)
    if (!item) fallo("El producto ya no está en tu carrito", 404)
    return item
}

export const carritoMock: CarritoService = {
    obtener: async () => {
        const usuario = usuarioSesion()
        return ok(carritoDe(db(), usuario.id))
    },
    agregar: async (productoId, cantidad) => {
        const carrito = transaccion((base) => {
            const usuario = usuarioSesion(base)
            const existente = base.carrito.find((item) => item.usuarioId === usuario.id && item.productoId === productoId)
            const total = (existente?.cantidad ?? 0) + cantidad
            validarCantidad(base, productoId, total)
            if (existente) existente.cantidad = total
            else base.carrito.push({ id: siguienteId(base.carrito), usuarioId: usuario.id, productoId, cantidad, createdAt: new Date().toISOString() })
            return carritoDe(base, usuario.id)
        })
        return ok(carrito, "Producto agregado al carrito")
    },
    actualizar: async (itemId, cantidad) => {
        const carrito = transaccion((base) => {
            const usuario = usuarioSesion(base)
            const item = itemDelUsuario(base, usuario.id, itemId)
            validarCantidad(base, item.productoId, cantidad)
            item.cantidad = cantidad
            return carritoDe(base, usuario.id)
        })
        return ok(carrito, "Cantidad actualizada")
    },
    eliminar: async (itemId) => {
        const carrito = transaccion((base) => {
            const usuario = usuarioSesion(base)
            itemDelUsuario(base, usuario.id, itemId)
            base.carrito = base.carrito.filter((item) => item.id !== itemId)
            return carritoDe(base, usuario.id)
        })
        return ok(carrito, "Producto eliminado")
    },
    vaciar: async () => {
        const carrito = transaccion((base) => {
            const usuario = usuarioSesion(base)
            base.carrito = base.carrito.filter((item) => item.usuarioId !== usuario.id)
            return carritoDe(base, usuario.id)
        })
        return ok(carrito, "Carrito vacío")
    }
}
