import type { Servicio } from "../types"
const colors = { activo: "text-emerald-600", proximo: "text-amber-600", vencido: "text-red-600" }
export function ServiceCard({ servicio }: { servicio: Servicio }) {
    const dias = Math.max(0, Math.ceil((new Date(servicio.fechaVencimiento).getTime() - Date.now()) / 86400000))
    return <article className="rounded-xl border bg-white p-4"><p className="font-semibold">{servicio.plataforma}</p><p>{dias} días restantes</p><p className={colors[servicio.estado]}>{servicio.estado}</p><button type="button" className="mt-3 rounded bg-brand px-3 py-2 text-white">Copiar credenciales</button></article>
}
