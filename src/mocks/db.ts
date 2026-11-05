import { ApiError, tokenActual } from "../services/http"
import type { ApiResponse, Carrito, Compra, Cuenta, EstadoCompra, EstadoCuenta, Pantalla, Plataforma, Producto, Servicio, TipoProducto, Usuario } from "../types"

export interface UsuarioDb extends Usuario {
    password: string
}

export interface ProductoDb {
    id: number
    plataformaId: number
    tipo: TipoProducto
    duracionDias: number
    precio: number
    activo: boolean
}

export interface CuentaDb {
    id: number
    plataformaId: number
    emailAcceso: string
    passwordAcceso: string
    estado: EstadoCuenta
    createdAt: string
}

export interface CarritoDb {
    id: number
    usuarioId: number
    productoId: number
    cantidad: number
    createdAt: string
}

export interface CompraDb {
    id: number
    usuarioId: number
    total: number
    estado: EstadoCompra
    metodoPago: string
    createdAt: string
    pagadaAt: string | null
}

export interface CompraItemDb {
    id: number
    compraId: number
    productoId: number
    cantidad: number
    precioUnitario: number
    subtotal: number
}

export interface ServicioDb {
    id: number
    compraItemId: number
    usuarioId: number
    cuentaId: number
    pantallaId: number | null
    fechaInicio: string
    fechaVencimiento: string
    estado: "activo" | "vencido"
}

export interface NotificacionDb {
    id: number
    servicioId: number
    tipo: "3_dias" | "1_dia" | "vencido"
    enviadaAt: string
}

export interface MockDb {
    usuarios: UsuarioDb[]
    plataformas: Plataforma[]
    productos: ProductoDb[]
    cuentas: CuentaDb[]
    pantallas: Pantalla[]
    carrito: CarritoDb[]
    compras: CompraDb[]
    compraItems: CompraItemDb[]
    servicios: ServicioDb[]
    notificaciones: NotificacionDb[]
}

const CLAVE = "phoenixmax-mock-db-v2"
const DIA = 86400000

let estado: MockDb | null = null
let crearSemilla: () => MockDb = () => {
    throw new Error("Semilla no registrada")
}

export function registrarSemilla(semilla: () => MockDb) {
    crearSemilla = semilla
}

export function db(): MockDb {
    if (estado) return estado
    try {
        const guardado = localStorage.getItem(CLAVE)
        if (guardado) {
            estado = JSON.parse(guardado) as MockDb
            return estado
        }
    } catch {
        estado = null
    }
    estado = crearSemilla()
    guardar()
    return estado
}

export function guardar() {
    try {
        localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
        return
    }
}

export function reiniciar() {
    estado = crearSemilla()
    guardar()
}

export function transaccion<T>(trabajo: (copia: MockDb) => T): T {
    const copia = structuredClone(db())
    const resultado = trabajo(copia)
    estado = copia
    guardar()
    return resultado
}

export function siguienteId(lista: { id: number }[]) {
    return lista.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

export function sumarDias(fecha: Date, dias: number) {
    return new Date(fecha.getTime() + dias * DIA)
}

export function diasRestantes(fechaIso: string) {
    return Math.ceil((new Date(fechaIso).getTime() - Date.now()) / DIA)
}

export async function ok<T>(data: T, message = "OK"): Promise<ApiResponse<T>> {
    await new Promise((resolve) => setTimeout(resolve, 250))
    return { ok: true, message, data: structuredClone(data) }
}

export function fallo(message: string, status = 400): never {
    throw new ApiError(message, status)
}

export function usuarioSesion(base: MockDb = db()): UsuarioDb {
    const token = tokenActual()
    const id = token?.startsWith("mock.") ? Number(token.slice(5)) : NaN
    const usuario = base.usuarios.find((item) => item.id === id)
    if (!usuario) fallo("Tu sesión expiró, inicia sesión de nuevo", 401)
    if (!usuario.activo) fallo("Tu usuario está desactivado", 403)
    return usuario
}

export function adminSesion(base: MockDb = db()) {
    const usuario = usuarioSesion(base)
    if (usuario.rol !== "admin") fallo("No tienes permisos de administrador", 403)
    return usuario
}

export function sinPassword(usuario: UsuarioDb): Usuario {
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol,
        activo: usuario.activo,
        createdAt: usuario.createdAt
    }
}

export function plataformaDe(base: MockDb, id: number) {
    const plataforma = base.plataformas.find((item) => item.id === id)
    if (!plataforma) fallo("Plataforma no encontrada", 404)
    return plataforma
}

export function vendidasDeCuenta(base: MockDb, cuentaId: number) {
    return base.pantallas.filter((item) => item.cuentaId === cuentaId && item.estado === "vendida").length
}

export function stockDe(base: MockDb, producto: ProductoDb) {
    const cuentas = base.cuentas.filter((cuenta) => cuenta.plataformaId === producto.plataformaId && cuenta.estado !== "inactiva")
    if (producto.tipo === "cuenta") {
        return cuentas.filter((cuenta) => cuenta.estado === "disponible" && vendidasDeCuenta(base, cuenta.id) === 0).length
    }
    return cuentas
        .filter((cuenta) => cuenta.estado !== "vendida")
        .reduce((total, cuenta) => total + base.pantallas.filter((item) => item.cuentaId === cuenta.id && item.estado === "disponible").length, 0)
}

export function productoCompleto(base: MockDb, producto: ProductoDb): Producto {
    return {
        ...producto,
        plataforma: plataformaDe(base, producto.plataformaId),
        stock: stockDe(base, producto)
    }
}

export function productoPorId(base: MockDb, id: number) {
    const producto = base.productos.find((item) => item.id === id)
    if (!producto) fallo("Producto no encontrado", 404)
    return producto
}

export function nombreProducto(base: MockDb, producto: ProductoDb) {
    const plataforma = plataformaDe(base, producto.plataformaId)
    return `${plataforma.nombre} · ${producto.tipo === "cuenta" ? "Cuenta completa" : "Pantalla"}`
}

export function carritoDe(base: MockDb, usuarioId: number): Carrito {
    const items = base.carrito
        .filter((item) => item.usuarioId === usuarioId)
        .map((item) => {
            const producto = productoCompleto(base, productoPorId(base, item.productoId))
            return { id: item.id, producto, cantidad: item.cantidad, subtotal: producto.precio * item.cantidad }
        })
    return { items, total: items.reduce((total, item) => total + item.subtotal, 0) }
}

export function compraCompleta(base: MockDb, compra: CompraDb): Compra {
    const usuario = base.usuarios.find((item) => item.id === compra.usuarioId)
    return {
        ...compra,
        usuarioNombre: usuario?.nombre ?? "Usuario eliminado",
        items: base.compraItems
            .filter((item) => item.compraId === compra.id)
            .map((item) => ({
                id: item.id,
                producto: productoCompleto(base, productoPorId(base, item.productoId)),
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.subtotal
            }))
    }
}

export function servicioCompleto(base: MockDb, servicio: ServicioDb): Servicio {
    const cuenta = base.cuentas.find((item) => item.id === servicio.cuentaId)
    if (!cuenta) fallo("Cuenta no encontrada", 404)
    const pantalla = base.pantallas.find((item) => item.id === servicio.pantallaId) ?? null
    const compraItem = base.compraItems.find((item) => item.id === servicio.compraItemId)
    return {
        id: servicio.id,
        compraId: compraItem?.compraId ?? 0,
        plataforma: plataformaDe(base, cuenta.plataformaId),
        tipo: pantalla ? "pantalla" : "cuenta",
        emailAcceso: cuenta.emailAcceso,
        passwordAcceso: cuenta.passwordAcceso,
        nombrePerfil: pantalla?.nombrePerfil ?? null,
        pin: pantalla?.pin ?? null,
        fechaInicio: servicio.fechaInicio,
        fechaVencimiento: servicio.fechaVencimiento,
        estado: diasRestantes(servicio.fechaVencimiento) < 0 ? "vencido" : servicio.estado
    }
}

export function cuentaCompleta(base: MockDb, cuenta: CuentaDb): Cuenta {
    return {
        id: cuenta.id,
        plataforma: plataformaDe(base, cuenta.plataformaId),
        emailAcceso: cuenta.emailAcceso,
        estado: cuenta.estado,
        createdAt: cuenta.createdAt,
        pantallas: base.pantallas.filter((item) => item.cuentaId === cuenta.id)
    }
}

export function recalcularCuenta(base: MockDb, cuenta: CuentaDb) {
    if (cuenta.estado === "inactiva") return
    const total = base.pantallas.filter((item) => item.cuentaId === cuenta.id).length
    const vendidas = vendidasDeCuenta(base, cuenta.id)
    cuenta.estado = vendidas === 0 ? "disponible" : vendidas >= total ? "vendida" : "parcial"
}

export function crearPantallas(base: MockDb, cuenta: CuentaDb) {
    const plataforma = plataformaDe(base, cuenta.plataformaId)
    for (let numero = 1; numero <= plataforma.maxPantallas; numero += 1) {
        const id = siguienteId(base.pantallas)
        base.pantallas.push({
            id,
            cuentaId: cuenta.id,
            nombrePerfil: `Perfil ${numero}`,
            pin: String(1000 + ((id * 7919) % 9000)),
            estado: "disponible"
        })
    }
}

export function asignarUnidad(base: MockDb, producto: ProductoDb, usuarioId: number, compraItemId: number, inicio: Date) {
    const cuentas = base.cuentas.filter((cuenta) => cuenta.plataformaId === producto.plataformaId && cuenta.estado !== "inactiva")
    let cuentaId = 0
    let pantallaId: number | null = null
    if (producto.tipo === "cuenta") {
        const cuenta = cuentas.find((item) => item.estado === "disponible" && vendidasDeCuenta(base, item.id) === 0)
        if (!cuenta) fallo(`Se agotó ${nombreProducto(base, producto)}`, 409)
        base.pantallas.filter((item) => item.cuentaId === cuenta.id).forEach((item) => {
            item.estado = "vendida"
        })
        cuenta.estado = "vendida"
        cuentaId = cuenta.id
    } else {
        const ordenadas = [...cuentas.filter((item) => item.estado === "parcial"), ...cuentas.filter((item) => item.estado === "disponible")]
        const pantalla = ordenadas
            .map((cuenta) => base.pantallas.find((item) => item.cuentaId === cuenta.id && item.estado === "disponible"))
            .find((item) => item !== undefined)
        if (!pantalla) fallo(`Se agotó ${nombreProducto(base, producto)}`, 409)
        pantalla.estado = "vendida"
        const cuenta = base.cuentas.find((item) => item.id === pantalla.cuentaId)
        if (cuenta) recalcularCuenta(base, cuenta)
        cuentaId = pantalla.cuentaId
        pantallaId = pantalla.id
    }
    const vencimiento = sumarDias(inicio, producto.duracionDias)
    base.servicios.push({
        id: siguienteId(base.servicios),
        compraItemId,
        usuarioId,
        cuentaId,
        pantallaId,
        fechaInicio: inicio.toISOString(),
        fechaVencimiento: vencimiento.toISOString(),
        estado: vencimiento.getTime() < Date.now() ? "vencido" : "activo"
    })
}
