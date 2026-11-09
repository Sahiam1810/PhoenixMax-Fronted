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
    agregar: async (productoId, cantidad, servicioId) => {
        const carrito = transaccion((base) => {
            const usuario = usuarioSesion(base)
            if (servicioId !== undefined) {
                const servicio = base.servicios.find((item) => item.id === servicioId && item.usuarioId === usuario.id)
                const productoOriginal = servicio ? base.compraItems.find((item) => item.id === servicio.compraItemId) : undefined
                const producto = productoPorId(base, productoId)
                const original = productoOriginal ? productoPorId(base, productoOriginal.productoId) : undefined
                if (!servicio || !original || original.tipo !== producto.tipo || original.plataformaId !== producto.plataformaId || !producto.activo) fallo("Servicio no encontrado", 404)
                if (base.carrito.some((item) => item.usuarioId === usuario.id && item.productoId === productoId && item.servicioId === servicioId)) fallo("Este servicio ya está en el carrito para renovación", 409)
                base.carrito.push({ id: siguienteId(base.carrito), usuarioId: usuario.id, productoId, servicioId, cantidad: 1, createdAt: new Date().toISOString() })
                return carritoDe(base, usuario.id)
            }
            const existente = base.carrito.find((item) => item.usuarioId === usuario.id && item.productoId === productoId && !item.servicioId)
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
            if (item.servicioId) fallo("La cantidad de una renovación es siempre 1", 400)
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
