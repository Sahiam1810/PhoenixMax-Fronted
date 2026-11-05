import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react"
import type { Plataforma } from "../types"
import { IconoMas, IconoMenos, LogoAlas } from "./iconos"

type VarianteBoton = "primario" | "marca" | "secundario" | "peligro" | "fantasma"

const estilosBoton: Record<VarianteBoton, string> = {
    primario: "bg-ink text-white hover:bg-neutral-800",
    marca: "bg-brand text-ink hover:bg-brand-600",
    secundario: "border border-slate-300 bg-white text-ink hover:bg-slate-50",
    peligro: "text-red-600 hover:bg-red-50",
    fantasma: "text-slate-700 hover:bg-slate-100"
}

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variante?: VarianteBoton
    cargando?: boolean
}

export function Boton({ variante = "primario", cargando = false, className = "", children, disabled, type = "button", ...props }: BotonProps) {
    return (
        <button
            type={type}
            disabled={disabled || cargando}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${estilosBoton[variante]} ${className}`}
            {...props}
        >
            {cargando ? "Procesando..." : children}
        </button>
    )
}

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
    etiqueta: string
    error?: string
}

export function Campo({ etiqueta, error, id, className = "", ...props }: CampoProps) {
    const campoId = id ?? props.name
    return (
        <label htmlFor={campoId} className={`block ${className}`}>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">{etiqueta}</span>
            <input
                id={campoId}
                aria-invalid={error ? true : undefined}
                className={`w-full rounded-lg border bg-slate-100 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand ${error ? "border-red-400" : "border-transparent"}`}
                {...props}
            />
            {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
        </label>
    )
}

interface SelectorProps extends SelectHTMLAttributes<HTMLSelectElement> {
    etiqueta: string
}

export function Selector({ etiqueta, id, children, className = "", ...props }: SelectorProps) {
    const campoId = id ?? props.name
    return (
        <label htmlFor={campoId} className={`block ${className}`}>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">{etiqueta}</span>
            <select id={campoId} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand" {...props}>
                {children}
            </select>
        </label>
    )
}

type TipoAviso = "error" | "exito" | "info" | "alerta"

const estilosAviso: Record<TipoAviso, string> = {
    error: "border-red-200 bg-red-50 text-red-700",
    exito: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-sky-200 bg-sky-50 text-sky-800",
    alerta: "border-amber-200 bg-amber-50 text-amber-800"
}

export function Aviso({ tipo = "info", children }: { tipo?: TipoAviso, children: ReactNode }) {
    return <div role={tipo === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${estilosAviso[tipo]}`}>{children}</div>
}

export function Cargando({ texto = "Cargando..." }: { texto?: string }) {
    return (
        <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
            <span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-ink" />
            {texto}
        </div>
    )
}

export function Vacio({ titulo, children }: { titulo: string, children?: ReactNode }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <p className="font-semibold text-ink">{titulo}</p>
            {children && <div className="mt-2 text-sm text-slate-500">{children}</div>}
        </div>
    )
}

export function Insignia({ children, className = "bg-slate-100 text-slate-700" }: { children: ReactNode, className?: string }) {
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>
}

export function TituloSeccion({ children, id }: { children: ReactNode, id?: string }) {
    return (
        <div className="mb-6 flex items-center gap-4" id={id}>
            <h2 className="shrink-0 text-sm font-bold uppercase tracking-wide text-ink">{children}</h2>
            <div className="relative h-0.5 flex-1 bg-ink">
                <span className="absolute -top-1 left-0 size-2.5 rounded-full bg-ink" />
                <span className="absolute -top-1 right-0 size-2.5 rounded-full bg-ink" />
            </div>
        </div>
    )
}

export function Marca({ grande = false }: { grande?: boolean }) {
    return (
        <span className={`inline-flex items-center gap-2 font-extrabold tracking-tight text-ink ${grande ? "text-4xl sm:text-6xl" : "text-lg"}`}>
            <LogoAlas className={`text-white ${grande ? "h-12 w-14 sm:h-16 sm:w-20" : "h-6 w-7"}`} />
            PhoenixMax
        </span>
    )
}

export function LogoPlataforma({ plataforma, className = "" }: { plataforma: Plataforma, className?: string }) {
    return (
        <div className={`relative flex items-center justify-center overflow-hidden bg-ink p-3 text-center ${className}`}>
            <span className="text-base font-extrabold leading-tight text-white">{plataforma.nombre}</span>
            <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ backgroundColor: plataforma.color }} />
        </div>
    )
}

interface SelectorCantidadProps {
    valor: number
    maximo: number
    onCambio: (valor: number) => void
    deshabilitado?: boolean
}

export function SelectorCantidad({ valor, maximo, onCambio, deshabilitado = false }: SelectorCantidadProps) {
    return (
        <div className="inline-flex items-center rounded-full border border-slate-300 bg-white">
            <button type="button" aria-label="Restar uno" disabled={deshabilitado || valor <= 1} onClick={() => onCambio(valor - 1)} className="grid size-9 place-items-center rounded-full text-slate-700 hover:bg-slate-100 disabled:opacity-40">
                <IconoMenos className="size-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold" aria-live="polite">{valor}</span>
            <button type="button" aria-label="Sumar uno" disabled={deshabilitado || valor >= maximo} onClick={() => onCambio(valor + 1)} className="grid size-9 place-items-center rounded-full text-slate-700 hover:bg-slate-100 disabled:opacity-40">
                <IconoMas className="size-4" />
            </button>
        </div>
    )
}

export function Tarjeta({ children, className = "" }: { children: ReactNode, className?: string }) {
    return <div className={`rounded-2xl border border-slate-200 bg-white ${className}`}>{children}</div>
}
