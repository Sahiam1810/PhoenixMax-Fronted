import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { IconoAtras } from "./iconos"
import { FondoImagen, Marca } from "./ui"

export function AuthLayout({ titulo, subtitulo, children }: { titulo: string, subtitulo: string, children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col lg:flex-row">
            <FondoImagen src="/img/auth.jpg" className="text-white lg:order-2 lg:flex-1">
                <div className="flex h-full min-h-40 flex-col justify-between gap-10 px-6 py-8 sm:px-12 lg:min-h-screen lg:p-16">
                    <Link to="/" aria-label="Ir al inicio" className="self-start">
                        <Marca clara />
                    </Link>
                    <div className="hidden lg:block">
                        <p className="max-w-md font-display text-5xl leading-tight">Tus plataformas favoritas, listas en minutos.</p>
                        <p className="mt-4 max-w-md text-white/70">Streaming, IA y edición con entrega inmediata y soporte real.</p>
                    </div>
                </div>
            </FondoImagen>
            <main className="flex flex-1 flex-col px-6 py-8 sm:px-12 lg:max-w-xl lg:px-16">
                <Link to="/" className="inline-flex items-center gap-1 self-start text-sm font-semibold text-slate-600 hover:text-ink">
                    <IconoAtras className="size-4" />
                    Volver a la tienda
                </Link>
                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
                    <h1 className="text-center font-display text-4xl">{titulo}</h1>
                    <p className="mb-8 mt-2 text-center text-sm text-slate-500">{subtitulo}</p>
                    {children}
                </div>
            </main>
        </div>
    )
}
