import type { Categoria, Plataforma, TipoProducto } from "../types"
import { asignarUnidad, crearPantallas, productoPorId, siguienteId, sumarDias, type MockDb } from "./db"

const plataformas: Array<[string, string, string, Categoria, number]> = [
    ["Netflix", "Series, películas y documentales en HD y 4K.", "#e50914", "streaming", 5],
    ["Disney+", "Disney, Pixar, Marvel, Star Wars y National Geographic.", "#113ccf", "streaming", 4],
    ["Prime Video", "Películas, series y originales de Amazon.", "#00a8e1", "streaming", 3],
    ["Max", "Series de HBO, películas de Warner y más.", "#5822b4", "streaming", 5],
    ["ChatGPT Plus", "Asistente de IA con acceso a los modelos más recientes.", "#10a37f", "ia", 2],
    ["Canva Pro", "Diseño gráfico con plantillas y recursos premium.", "#00c4cc", "edicion", 5],
    ["CapCut Pro", "Edición de video con efectos y exportación sin marca de agua.", "#111111", "edicion", 2]
]

const precios: Array<[number, TipoProducto, number, number]> = [
    [1, "pantalla", 30, 16000],
    [1, "cuenta", 30, 62000],
    [1, "pantalla", 90, 44000],
    [2, "pantalla", 30, 12000],
    [2, "cuenta", 30, 38000],
    [3, "pantalla", 30, 9000],
    [3, "cuenta", 30, 24000],
    [4, "pantalla", 30, 11000],
    [4, "cuenta", 30, 42000],
    [5, "pantalla", 30, 45000],
    [5, "cuenta", 30, 85000],
    [6, "pantalla", 30, 8000],
    [6, "cuenta", 30, 30000],
    [7, "pantalla", 30, 25000],
    [7, "cuenta", 30, 45000]
]

function slug(nombre: string) {
    return nombre.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function compraSemilla(base: MockDb, usuarioId: number, productoId: number, cantidad: number, diasAtras: number) {
    const fecha = sumarDias(new Date(), -diasAtras)
    const producto = productoPorId(base, productoId)
    const compraId = siguienteId(base.compras)
    const total = producto.precio * cantidad
    base.compras.push({
        id: compraId,
        usuarioId,
        total,
        estado: "pagada",
        metodoPago: "simulado",
        createdAt: fecha.toISOString(),
        pagadaAt: fecha.toISOString()
    })
    const itemId = siguienteId(base.compraItems)
    base.compraItems.push({ id: itemId, compraId, productoId, cantidad, precioUnitario: producto.precio, subtotal: total })
    for (let unidad = 0; unidad < cantidad; unidad += 1) asignarUnidad(base, producto, usuarioId, itemId, fecha)
}

export function semilla(): MockDb {
    const ahora = new Date().toISOString()
    const base: MockDb = {
        usuarios: [
            { id: 1, nombre: "Admin Phoenix", email: "admin@phoenixmax.test", telefono: "3000000000", rol: "admin", activo: true, createdAt: ahora, password: "Admin123" },
            { id: 2, nombre: "Camila Rojas", email: "cliente@phoenixmax.test", telefono: "3001112233", rol: "cliente", activo: true, createdAt: ahora, password: "Cliente123" },
            { id: 3, nombre: "Andrés Pérez", email: "andres@phoenixmax.test", telefono: "3004445566", rol: "cliente", activo: true, createdAt: ahora, password: "Cliente123" }
        ],
        plataformas: plataformas.map(([nombre, descripcion, color, categoria, maxPantallas], indice): Plataforma => ({
            id: indice + 1,
            nombre,
            descripcion,
            logoUrl: "",
            color,
            categoria,
            maxPantallas,
            activo: true
        })),
        productos: precios.map(([plataformaId, tipo, duracionDias, precio], indice) => ({
            id: indice + 1,
            plataformaId,
            tipo,
            duracionDias,
            precio,
            activo: true
        })),
        cuentas: [],
        pantallas: [],
        carrito: [],
        compras: [],
        compraItems: [],
        servicios: [],
        notificaciones: []
    }
    base.plataformas.forEach((plataforma) => {
        for (let numero = 1; numero <= 3; numero += 1) {
            const cuenta = {
                id: siguienteId(base.cuentas),
                plataformaId: plataforma.id,
                emailAcceso: `${slug(plataforma.nombre)}0${numero}@phoenixmax.test`,
                passwordAcceso: `Demo-${slug(plataforma.nombre).slice(0, 4)}-${numero}${plataforma.id}7`,
                estado: "disponible" as const,
                createdAt: ahora
            }
            base.cuentas.push(cuenta)
            crearPantallas(base, cuenta)
        }
    })
    compraSemilla(base, 2, 1, 1, 27)
    compraSemilla(base, 2, 4, 1, 29)
    compraSemilla(base, 2, 6, 1, 10)
    compraSemilla(base, 2, 12, 1, 40)
    compraSemilla(base, 3, 9, 1, 3)
    compraSemilla(base, 2, 8, 1, 5)
    compraSemilla(base, 3, 1, 2, 1)
    base.carrito.push({ id: 1, usuarioId: 2, productoId: 9, cantidad: 1, createdAt: ahora })
    return base
}
