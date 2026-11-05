import type { Categoria, EstadoCompra, EstadoCuenta, EstadoVisualServicio, Servicio, TipoProducto } from "../types"

const moneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
const fecha = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" })
const fechaHora = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

export function precio(valor: number) {
    return moneda.format(valor)
}

export function formatoFecha(iso: string) {
    return fecha.format(new Date(iso))
}

export function formatoFechaHora(iso: string) {
    return fechaHora.format(new Date(iso))
}

export function diasHasta(iso: string) {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

export function estadoServicio(servicio: Servicio): EstadoVisualServicio {
    const dias = diasHasta(servicio.fechaVencimiento)
    if (servicio.estado === "vencido" || dias < 0) return "vencido"
    if (dias <= 3) return "por_vencer"
    return "activo"
}

export const etiquetaEstadoServicio: Record<EstadoVisualServicio, string> = {
    activo: "Activo",
    por_vencer: "Por vencer",
    vencido: "Vencido"
}

export const etiquetaTipo: Record<TipoProducto, string> = {
    cuenta: "Cuenta completa",
    pantalla: "Pantalla individual"
}

export const etiquetaCategoria: Record<Categoria, string> = {
    streaming: "Streaming",
    ia: "IA",
    edicion: "Edición"
}

export const etiquetaEstadoCompra: Record<EstadoCompra, string> = {
    pendiente: "Pendiente",
    pagada: "Pagada",
    cancelada: "Cancelada"
}

export const etiquetaEstadoCuenta: Record<EstadoCuenta, string> = {
    disponible: "Disponible",
    parcial: "Parcial",
    vendida: "Vendida",
    inactiva: "Inactiva"
}

export function duracion(dias: number) {
    if (dias % 30 === 0) {
        const meses = dias / 30
        return meses === 1 ? "1 mes" : `${meses} meses`
    }
    return `${dias} días`
}

export function iniciales(nombre: string) {
    return nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase() ?? "")
        .join("")
}
