import type { ComprasService } from "../../services/comprasService"
import { asignarUnidad, compraCompleta, db, fallo, nombreProducto, ok, productoPorId, siguienteId, stockDe, transaccion, usuarioSesion, type MockDb } from ".."

function compraDelUsuario(base: MockDb, id: number) {
    const usuario = usuarioSesion(base)
    const compra = base.compras.find((item) => item.id === id && item.usuarioId === usuario.id)
    if (!compra) fallo("Compra no encontrada", 404)
    return compra
}

export const comprasMock: ComprasService = {
    crear: async () => {
        const compra = transaccion((base) => {
            const usuario = usuarioSesion(base)
            const lineas = base.carrito.filter((item) => item.usuarioId === usuario.id)
            if (lineas.length === 0) fallo("Tu carrito está vacío")
            const compraId = siguienteId(base.compras)
            let total = 0
            lineas.forEach((linea) => {
                const producto = productoPorId(base, linea.productoId)
                const subtotal = producto.precio * linea.cantidad
                total += subtotal
                base.compraItems.push({
                    id: siguienteId(base.compraItems),
                    compraId,
                    productoId: producto.id,
                    servicioRenovadoId: linea.servicioId ?? null,
                    cantidad: linea.cantidad,
                    precioUnitario: producto.precio,
                    subtotal
                })
            })
            const nueva = {
                id: compraId,
                usuarioId: usuario.id,
                total,
                estado: "pendiente" as const,
                metodoPago: "",
                createdAt: new Date().toISOString(),
                pagadaAt: null
            }
            base.compras.push(nueva)
            return compraCompleta(base, nueva)
        })
        return ok(compra, "Pedido creado")
    },
    pagar: async (id, metodoPago) => {
        const compra = transaccion((base) => {
            const actual = compraDelUsuario(base, id)
            if (actual.estado !== "pendiente") fallo("Esta compra ya fue procesada", 409)
            const items = base.compraItems.filter((item) => item.compraId === id)
            items.forEach((item) => {
                if (item.servicioRenovadoId) return
                const producto = productoPorId(base, item.productoId)
                const stock = stockDe(base, producto)
                if (item.cantidad > stock) {
                    fallo(`No hay stock suficiente de ${nombreProducto(base, producto)}. Pediste ${item.cantidad} y quedan ${stock}. Ajusta tu carrito e intenta de nuevo.`, 409)
                }
            })
            const ahora = new Date()
            items.forEach((item) => {
                const producto = productoPorId(base, item.productoId)
                if (item.servicioRenovadoId) {
                    const servicio = base.servicios.find((candidato) => candidato.id === item.servicioRenovadoId && candidato.usuarioId === actual.usuarioId)
                    if (!servicio) fallo("Servicio no encontrado", 404)
                    const baseFecha = Math.max(Date.now(), new Date(servicio.fechaVencimiento).getTime())
                    servicio.fechaVencimiento = new Date(baseFecha + producto.duracionDias * 86400000).toISOString()
                    servicio.estado = "activo"
                    base.notificaciones = base.notificaciones.filter((notificacion) => notificacion.servicioId !== servicio.id)
                    return
                }
                for (let unidad = 0; unidad < item.cantidad; unidad += 1) asignarUnidad(base, producto, actual.usuarioId, item.id, ahora)
            })
            actual.estado = "pagada"
            actual.metodoPago = metodoPago
            actual.pagadaAt = ahora.toISOString()
            base.carrito = base.carrito.filter((item) => item.usuarioId !== actual.usuarioId)
            return compraCompleta(base, actual)
        })
        return ok(compra, "Pago aprobado")
    },
    mias: async () => {
        const base = db()
        const usuario = usuarioSesion(base)
        const compras = base.compras
            .filter((item) => item.usuarioId === usuario.id)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((item) => compraCompleta(base, item))
        return ok(compras)
    },
    obtener: async (id) => {
        const base = db()
        return ok(compraCompleta(base, compraDelUsuario(base, id)))
    }
}
