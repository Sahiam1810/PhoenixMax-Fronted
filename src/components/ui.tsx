import { useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react"
import type { Plataforma } from "../types"
import { IconoMas, IconoMenos, LogoAlas } from "./iconos"

type VarianteBoton = "primario" | "marca" | "secundario" | "peligro" | "fantasma"

const estilosBoton: Record<VarianteBoton, string> = {
    primario: "bg-ink text-white hover:bg-neutral-800 dark:bg-white dark:text-ink dark:hover:bg-neutral-200",
    marca: "bg-brand text-ink hover:bg-brand-600",
    secundario: "border border-slate-300 bg-white text-ink hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
    peligro: "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30",
    fantasma: "text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
            <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-neutral-300">{etiqueta}</span>
            <input
                id={campoId}
                aria-invalid={error ? true : undefined}
                className={`w-full rounded-lg border bg-slate-100 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:placeholder:text-neutral-500 dark:focus:bg-neutral-850 ${error ? "border-red-400" : "border-transparent"}`}
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
            <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-neutral-300">{etiqueta}</span>
            <select id={campoId} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" {...props}>
                {children}
            </select>
        </label>
    )
}

type TipoAviso = "error" | "exito" | "info" | "alerta"

const estilosAviso: Record<TipoAviso, string> = {
    error: "border-red-200 bg-red-50 text-red-700",
    exito: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-brand-100 bg-brand-50 text-brand-700",
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
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-neutral-800 px-6 py-12 text-center">
            <p className="font-semibold text-ink dark:text-white">{titulo}</p>
            {children && <div className="mt-2 text-sm text-slate-500 dark:text-neutral-400">{children}</div>}
        </div>
    )
}

export function Insignia({ children, className = "bg-slate-100 text-slate-700" }: { children: ReactNode, className?: string }) {
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{children}</span>
}

export function TituloSeccion({ children, id }: { children: ReactNode, id?: string }) {
    return (
        <div className="mb-8" id={id}>
            <h2
                className="inline-block bg-brand py-3 pl-6 pr-12 text-xl font-bold tracking-tight text-ink sm:text-2xl"
                style={{ clipPath: "polygon(0 0, calc(100% - 1.5rem) 0, 100% 50%, calc(100% - 1.5rem) 100%, 0 100%)" }}
            >
                {children}
            </h2>
        </div>
    )
}

export function Marca({ grande = false, clara = false }: { grande?: boolean, clara?: boolean }) {
    return (
        <span className={`inline-flex items-center font-extrabold tracking-tight ${clara ? "text-white" : "text-ink"} ${grande ? "gap-3 text-4xl sm:text-6xl" : "gap-2 text-lg"}`}>
            <LogoAlas className={`${clara ? "text-brand" : "text-white"} ${grande ? "h-14 w-16 sm:h-20 sm:w-24" : "h-8 w-10"}`} />
            PhoenixMax
        </span>
    )
}

export function Contenedor({ children, className = "" }: { children: ReactNode, className?: string }) {
    return <div className={`mx-auto w-full max-w-[96rem] px-5 sm:px-10 lg:px-14 xl:px-28 ${className}`}>{children}</div>
}

export function FondoImagen({ src, className = "", children }: { src: string, className?: string, children?: ReactNode }) {
    return (
        <div
            className={`relative overflow-hidden bg-ink bg-cover bg-center ${className}`}
            style={{ backgroundImage: `url("${src}")` }}
        >
            <div className="absolute inset-0 bg-ink/60" />
            <div className="relative">{children}</div>
        </div>
    )
}

function inicial(nombre: string) {
    const limpio = nombre.trim()
    return `${limpio.charAt(0).toUpperCase()}${limpio.endsWith("+") ? "+" : ""}`
}

export function IconoPlataforma({ plataforma, className = "size-12 text-xl" }: { plataforma: Plataforma, className?: string }) {
    const [fallo, setFallo] = useState(false)
    if (plataforma.logoUrl && !fallo) {
        return <img src={plataforma.logoUrl} alt={`Logo de ${plataforma.nombre}`} onError={() => setFallo(true)} className={`object-contain ${className}`} />
    }
    return (
        <span aria-hidden="true" className={`grid place-items-center rounded-2xl font-black text-white ${className}`} style={{ backgroundColor: plataforma.color }}>
            {inicial(plataforma.nombre)}
        </span>
    )
}

export function LogoPlataforma({ plataforma, className = "", tamano = "normal" }: { plataforma: Plataforma, className?: string, tamano?: "mini" | "normal" | "grande" }) {
    const icono = tamano === "mini" ? "size-7 text-xs rounded-lg" : tamano === "grande" ? "size-24 text-4xl sm:size-32 sm:text-5xl" : "size-12 text-xl"
    return (
        <div className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-ink p-2 text-center ${className}`}>
            <IconoPlataforma plataforma={plataforma} className={icono} />
            {tamano !== "mini" && <span className={`font-bold leading-tight text-white ${tamano === "grande" ? "text-2xl" : "text-xs"}`}>{plataforma.nombre}</span>}
            <span className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: plataforma.color }} />
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
    return <div className={`rounded-2xl border border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${className}`}>{children}</div>
}
