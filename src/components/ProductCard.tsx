import { Link } from "react-router-dom"
import { duracion, etiquetaTipo, precio } from "../lib/formato"
import type { Producto } from "../types"
import { IconoPlataforma, Insignia } from "./ui"

export function ProductCard({ producto }: { producto: Producto }) {
    const agotado = producto.stock === 0
    return (
        <Link
            to={`/producto/${producto.id}`}
            className={`group flex min-h-36 overflow-hidden rounded-2xl bg-suave/50 transition-colors duration-150 hover:bg-suave ${agotado ? "opacity-70" : ""}`}
        >
            <div className="relative grid w-32 shrink-0 place-items-center overflow-hidden rounded-2xl bg-ink sm:w-36">
                <IconoPlataforma plataforma={producto.plataforma} className="size-14 rounded-2xl text-2xl" />
                <span className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: producto.plataforma.color }} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-bold">{producto.plataforma.nombre}</p>
                        {agotado && <Insignia className="bg-red-100 text-red-700">Agotado</Insignia>}
                    </div>
                    <p className="text-sm text-slate-600">{etiquetaTipo[producto.tipo]} · {duracion(producto.duracionDias)}</p>
                </div>
                <div className="flex items-end justify-between gap-2">
                    <p className="text-lg font-extrabold">{precio(producto.precio)}</p>
                    <p className={`text-xs font-semibold ${agotado ? "text-red-600" : producto.stock <= 2 ? "text-amber-700" : "text-slate-500"}`}>
                        {agotado ? "Sin stock" : `Stock: ${producto.stock}`}
                    </p>
                </div>
            </div>
        </Link>
    )
}
