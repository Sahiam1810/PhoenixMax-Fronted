import type { ReactNode } from "react"
import { NavLink, Outlet } from "react-router-dom"

const secciones = [
    { ruta: "/admin", texto: "Resumen", fin: true },
    { ruta: "/admin/inventario", texto: "Inventario", fin: false },
    { ruta: "/admin/usuarios", texto: "Usuarios", fin: false },
    { ruta: "/admin/productos", texto: "Productos", fin: false },
    { ruta: "/admin/plataformas", texto: "Plataformas", fin: false },
    { ruta: "/admin/ventas", texto: "Ventas", fin: false }
]

export function AdminLayout() {
    return (
        <div>
            <div className="mb-6 border-b border-slate-200 dark:border-neutral-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">Administración</p>
                <nav className="-mx-5 mt-2 flex overflow-x-auto px-5 sm:mx-0 sm:px-0">
                    {secciones.map((seccion) => (
                        <NavLink
                            key={seccion.ruta}
                            to={seccion.ruta}
                            end={seccion.fin}
                            className={({ isActive }) => `-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? "border-ink text-ink dark:border-brand dark:text-brand" : "border-transparent text-slate-500 hover:text-ink dark:text-neutral-400 dark:hover:text-white"}`}
                        >
                            {seccion.texto}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <Outlet />
        </div>
    )
}

export function EncabezadoAdmin({ titulo, descripcion, acciones }: { titulo: string, descripcion?: string, acciones?: ReactNode }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h1 className="text-xl font-bold sm:text-2xl text-ink dark:text-white">{titulo}</h1>
                {descripcion && <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{descripcion}</p>}
            </div>
            {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
        </div>
    )
}

export function ConFiltros({ filtros, children }: { filtros: ReactNode, children: ReactNode }) {
    return (
        <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
            <aside className="space-y-5 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:self-start dark:border-neutral-800 dark:bg-neutral-900/60">{filtros}</aside>
            <div className="min-w-0">{children}</div>
        </div>
    )
}

interface OpcionFiltro<T extends string> {
    valor: T
    texto: string
    cantidad?: number
}

export function GrupoFiltro<T extends string>({ titulo, opciones, valor, onCambio }: { titulo: string, opciones: OpcionFiltro<T>[], valor: T, onCambio: (valor: T) => void }) {
    return (
        <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">{titulo}</legend>
            <div className="flex flex-wrap gap-1 lg:flex-col">
                {opciones.map((opcion) => (
                    <button
                        key={opcion.valor}
                        type="button"
                        onClick={() => onCambio(opcion.valor)}
                        aria-pressed={valor === opcion.valor}
                        className={`flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${valor === opcion.valor ? "bg-ink text-white dark:bg-brand dark:text-ink font-semibold" : "text-slate-700 hover:bg-slate-200 dark:text-neutral-300 dark:hover:bg-neutral-800"}`}
                    >
                        <span>{opcion.texto}</span>
                        {opcion.cantidad !== undefined && <span className="text-xs opacity-70">{opcion.cantidad}</span>}
                    </button>
                ))}
            </div>
        </fieldset>
    )
}

export function Tabla({ children }: { children: ReactNode }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-neutral-800">
            <table className="w-full min-w-[40rem] text-left text-sm">{children}</table>
        </div>
    )
}

export function Th({ children, className = "" }: { children?: ReactNode, className?: string }) {
    return <th className={`border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400 ${className}`}>{children}</th>
}

export function Td({ children, className = "" }: { children?: ReactNode, className?: string }) {
    return <td className={`border-b border-slate-100 px-3 py-2.5 align-middle dark:border-neutral-800/60 dark:text-neutral-200 ${className}`}>{children}</td>
}

export function Indicador({ etiqueta, valor, detalle }: { etiqueta: string, valor: string, detalle?: string }) {
    return (
        <div className="rounded-lg border border-slate-200 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">{etiqueta}</p>
            <p className="mt-1 text-2xl font-bold text-ink dark:text-white">{valor}</p>
            {detalle && <p className="mt-0.5 text-xs text-slate-500 dark:text-neutral-400">{detalle}</p>}
        </div>
    )
}

export function Panel({ titulo, children, onCerrar }: { titulo: string, children: ReactNode, onCerrar?: () => void }) {
    return (
        <section className="mb-6 rounded-lg border border-slate-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-ink dark:text-white">{titulo}</h2>
                {onCerrar && <button type="button" onClick={onCerrar} className="text-sm text-slate-500 hover:text-ink dark:text-neutral-400 dark:hover:text-white">Cerrar</button>}
            </div>
            {children}
        </section>
    )
}
