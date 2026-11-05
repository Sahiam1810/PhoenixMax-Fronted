import { useCallback, useState } from "react"
import { EncabezadoAdmin, Indicador, Tabla, Td, Th } from "../../components/admin"
import { Aviso, Cargando, Insignia } from "../../components/ui"
import { useCarga } from "../../hooks/useCarga"
import { etiquetaEstadoCompra, etiquetaTipo, formatoFechaHora, precio } from "../../lib/formato"
import { adminService } from "../../services/adminService"
import type { EstadoCompra } from "../../types"

const estados: EstadoCompra[] = ["pagada", "pendiente", "cancelada"]
const cargarResumen = () => adminService.resumen()

function esEstado(valor: string): valor is EstadoCompra {
    return valor === "pagada" || valor === "pendiente" || valor === "cancelada"
}

export function Ventas() {
    const [estado, setEstado] = useState<EstadoCompra | "">("")
    const [desde, setDesde] = useState("")
    const [hasta, setHasta] = useState("")
    const cargarCompras = useCallback(() => adminService.compras({ estado: estado || undefined, desde: desde || undefined, hasta: hasta || undefined }), [estado, desde, hasta])
    const compras = useCarga(cargarCompras)
    const resumen = useCarga(cargarResumen)
    const lista = compras.data ?? []
    const totalFiltrado = lista.filter((item) => item.estado === "pagada").reduce((total, item) => total + item.total, 0)

    return (
        <div>
            <EncabezadoAdmin titulo="Ventas" descripcion="Compras registradas con filtros por estado y fecha" />
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                <Indicador etiqueta="Hoy" valor={precio(resumen.data?.ventasHoy ?? 0)} detalle={`${resumen.data?.comprasHoy ?? 0} compras pagadas`} />
                <Indicador etiqueta="Este mes" valor={precio(resumen.data?.ventasMes ?? 0)} detalle={`${resumen.data?.comprasMes ?? 0} compras pagadas`} />
                <Indicador etiqueta="Total filtrado" valor={precio(totalFiltrado)} detalle={`${lista.length} compras en la lista`} />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-4">
                <label className="col-span-2 text-sm sm:col-span-1">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</span>
                    <select value={estado} onChange={(evento) => setEstado(esEstado(evento.target.value) ? evento.target.value : "")} className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5">
                        <option value="">Todos</option>
                        {estados.map((item) => <option key={item} value={item}>{etiquetaEstadoCompra[item]}</option>)}
                    </select>
                </label>
                <label className="text-sm">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Desde</span>
                    <input type="date" value={desde} onChange={(evento) => setDesde(evento.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5" />
                </label>
                <label className="text-sm">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Hasta</span>
                    <input type="date" value={hasta} onChange={(evento) => setHasta(evento.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5" />
                </label>
                <div className="col-span-2 flex items-end sm:col-span-1">
                    <button type="button" onClick={() => { setEstado(""); setDesde(""); setHasta("") }} className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm hover:bg-slate-100">Limpiar filtros</button>
                </div>
            </div>
            {compras.cargando && !compras.data && <Cargando />}
            {compras.error && <Aviso tipo="error">{compras.error}</Aviso>}
            {compras.data && (
                <Tabla>
                    <thead>
                        <tr>
                            <Th>Pedido</Th>
                            <Th>Cliente</Th>
                            <Th>Productos</Th>
                            <Th>Fecha</Th>
                            <Th>Estado</Th>
                            <Th className="text-right">Total</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {lista.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">Sin compras para estos filtros</td></tr>}
                        {lista.map((compra) => (
                            <tr key={compra.id}>
                                <Td className="font-medium">#{compra.id}</Td>
                                <Td>{compra.usuarioNombre}</Td>
                                <Td className="text-xs text-slate-600">
                                    {compra.items.map((item) => <p key={item.id}>{item.cantidad} × {item.producto.plataforma.nombre} · {etiquetaTipo[item.producto.tipo]}</p>)}
                                </Td>
                                <Td className="whitespace-nowrap text-xs text-slate-500">{formatoFechaHora(compra.createdAt)}</Td>
                                <Td>
                                    <Insignia className={compra.estado === "pagada" ? "bg-emerald-100 text-emerald-800" : compra.estado === "pendiente" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"}>
                                        {etiquetaEstadoCompra[compra.estado]}
                                    </Insignia>
                                </Td>
                                <Td className="text-right font-semibold">{precio(compra.total)}</Td>
                            </tr>
                        ))}
                    </tbody>
                </Tabla>
            )}
        </div>
    )
}
