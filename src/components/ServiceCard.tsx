import { useState } from "react"
import { diasHasta, estadoServicio, etiquetaEstadoServicio, etiquetaTipo, formatoFecha } from "../lib/formato"
import type { EstadoVisualServicio, Servicio } from "../types"
import { IconoCheck, IconoCopiar, IconoOjo } from "./iconos"
import { Insignia } from "./ui"

const colores: Record<EstadoVisualServicio, string> = {
    activo: "bg-emerald-100 text-emerald-800",
    por_vencer: "bg-amber-100 text-amber-800",
    vencido: "bg-red-100 text-red-700"
}

const barras: Record<EstadoVisualServicio, string> = {
    activo: "bg-emerald-500",
    por_vencer: "bg-amber-400",
    vencido: "bg-red-500"
}

function textoDias(dias: number) {
    if (dias < 0) return `Venció hace ${Math.abs(dias)} ${Math.abs(dias) === 1 ? "día" : "días"}`
    if (dias === 0) return "Vence hoy"
    return `${dias} ${dias === 1 ? "día restante" : "días restantes"}`
}

function Dato({ etiqueta, valor }: { etiqueta: string, valor: string }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-slate-500">{etiqueta}</dt>
            <dd className="truncate font-mono text-sm font-semibold">{valor}</dd>
        </div>
    )
}

export function ServiceCard({ servicio }: { servicio: Servicio }) {
    const [verClave, setVerClave] = useState(false)
    const [copiado, setCopiado] = useState(false)
    const estado = estadoServicio(servicio)
    const dias = diasHasta(servicio.fechaVencimiento)
    const conCredenciales = servicio.emailAcceso !== null && servicio.passwordAcceso !== null

    const copiar = async () => {
        const lineas = [
            `${servicio.plataforma.nombre} (${etiquetaTipo[servicio.tipo]})`,
            `Correo: ${servicio.emailAcceso}`,
            `Contraseña: ${servicio.passwordAcceso}`
        ]
        if (servicio.nombrePerfil) lineas.push(`Perfil: ${servicio.nombrePerfil}`)
        if (servicio.pin) lineas.push(`PIN: ${servicio.pin}`)
        try {
            await navigator.clipboard.writeText(lineas.join("\n"))
            setCopiado(true)
            setTimeout(() => setCopiado(false), 2000)
        } catch {
            setCopiado(false)
        }
    }

    return (
        <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <span className={`absolute inset-y-0 left-0 w-1.5 ${barras[estado]}`} />
            <div className="space-y-4 p-5 pl-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="font-bold">{servicio.plataforma.nombre}</p>
                        <p className="text-sm text-slate-500">{etiquetaTipo[servicio.tipo]}</p>
                    </div>
                    <Insignia className={colores[estado]}>{etiquetaEstadoServicio[estado]}</Insignia>
                </div>
                {!conCredenciales && (
                    <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Este servicio venció, por eso sus credenciales ya no están disponibles.</p>
                )}
                {conCredenciales && <dl className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
                    <Dato etiqueta="Correo" valor={servicio.emailAcceso ?? ""} />
                    <div className="min-w-0">
                        <dt className="text-xs text-slate-500">Contraseña</dt>
                        <dd className="flex items-center gap-2">
                            <span className="truncate font-mono text-sm font-semibold">{verClave ? servicio.passwordAcceso : "••••••••"}</span>
                            <button type="button" onClick={() => setVerClave((valor) => !valor)} aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"} className="text-slate-500 hover:text-ink">
                                <IconoOjo className="size-4" />
                            </button>
                        </dd>
                    </div>
                    {servicio.nombrePerfil && <Dato etiqueta="Perfil" valor={servicio.nombrePerfil} />}
                    {servicio.pin && <Dato etiqueta="PIN" valor={servicio.pin} />}
                </dl>}
                <div className="flex flex-wrap items-end justify-between gap-3 text-sm">
                    <div className="space-y-0.5 text-slate-600">
                        <p>Compra: {formatoFecha(servicio.fechaInicio)}</p>
                        <p>Vence: <span className="font-semibold text-ink">{formatoFecha(servicio.fechaVencimiento)}</span></p>
                        <p className={`font-semibold ${estado === "activo" ? "text-emerald-700" : estado === "por_vencer" ? "text-amber-700" : "text-red-600"}`}>{textoDias(dias)}</p>
                    </div>
                    {conCredenciales && <button type="button" onClick={copiar} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 font-semibold transition-colors hover:bg-slate-50">
                        {copiado ? <IconoCheck className="size-4 text-emerald-600" /> : <IconoCopiar className="size-4" />}
                        {copiado ? "Copiado" : "Copiar credenciales"}
                    </button>}
                </div>
            </div>
        </article>
    )
}
