import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { IconoAtras } from "./iconos"
import { Marca } from "./ui"

const servicios = ["Netflix", "Disney+", "Prime Video", "Max", "ChatGPT Plus", "Canva Pro", "CapCut Pro", "Netflix", "Max", "Disney+", "Canva Pro", "Prime Video"]

export function AuthLayout({ titulo, subtitulo, children }: { titulo: string, subtitulo: string, children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col lg:flex-row">
            <aside className="relative overflow-hidden bg-brand px-6 py-8 lg:order-2 lg:flex lg:flex-1 lg:flex-col lg:p-16">
                <div className="pointer-events-none absolute inset-x-0 bottom-0 top-64 hidden grid-cols-3 content-start gap-4 p-10 opacity-15 lg:grid" aria-hidden="true">
                    {servicios.map((nombre, indice) => (
                        <span key={`${nombre}-${indice}`} className="rounded-2xl border-2 border-ink px-4 py-8 text-center text-xl font-extrabold">{nombre}</span>
                    ))}
                </div>
                <div className="relative">
                    <Link to="/" aria-label="Ir al inicio" className="lg:hidden">
                        <Marca />
                    </Link>
                    <div className="hidden lg:block">
                        <Marca grande />
                        <p className="mt-4 max-w-md text-lg font-semibold">Streaming, IA y edición con entrega inmediata.</p>
                    </div>
                </div>
            </aside>
            <main className="flex flex-1 flex-col px-6 py-8 lg:max-w-xl lg:px-16">
                <Link to="/" className="inline-flex items-center gap-1 self-start text-sm font-semibold text-slate-600 hover:text-ink">
                    <IconoAtras className="size-4" />
                    Volver a la tienda
                </Link>
                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
                    <h1 className="text-center text-3xl font-extrabold">{titulo}</h1>
                    <p className="mb-8 mt-2 text-center text-sm text-slate-500">{subtitulo}</p>
                    {children}
                </div>
            </main>
        </div>
    )
}
