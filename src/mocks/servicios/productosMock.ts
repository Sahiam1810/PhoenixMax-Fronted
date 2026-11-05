import type { ProductosService } from "../../services/productosService"
import { db, fallo, ok, productoCompleto, productoPorId } from ".."

export const productosMock: ProductosService = {
    listar: async (filtro = {}) => {
        const base = db()
        const productos = base.productos
            .filter((item) => item.activo)
            .map((item) => productoCompleto(base, item))
            .filter((item) => item.plataforma.activo)
            .filter((item) => !filtro.plataforma || item.plataformaId === filtro.plataforma)
            .filter((item) => !filtro.tipo || item.tipo === filtro.tipo)
            .filter((item) => !filtro.categoria || item.plataforma.categoria === filtro.categoria)
        return ok(productos)
    },
    obtener: async (id) => {
        const base = db()
        const producto = productoCompleto(base, productoPorId(base, id))
        if (!producto.activo || !producto.plataforma.activo) fallo("Producto no disponible", 404)
        return ok(producto)
    }
}
