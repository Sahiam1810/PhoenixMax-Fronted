import { useEffect, useState } from "react"

export interface SeccionProgreso {
    id: string
    titulo: string
}

export function ProgresoSecciones({ secciones }: { secciones: SeccionProgreso[] }) {
    const [progreso, setProgreso] = useState(0)
    const [activa, setActiva] = useState(secciones[0]?.id ?? "")

    useEffect(() => {
        let cuadro = 0
        const medir = () => {
            cuadro = 0
            const limite = window.innerHeight * 0.4
            const topes = secciones.map((seccion) => document.getElementById(seccion.id)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY)
            const indice = Math.max(0, topes.reduce((elegido, tope, posicion) => (tope <= limite ? posicion : elegido), 0))
            const siguiente = topes[indice + 1]
            const fraccion = siguiente !== undefined && Number.isFinite(siguiente)
                ? Math.min(1, Math.max(0, (limite - topes[indice]) / (siguiente - topes[indice])))
                : 0
            const tramos = Math.max(1, secciones.length - 1)
            const alFinal = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
            setProgreso(alFinal ? 1 : Math.min(1, (indice + fraccion) / tramos))
            setActiva(alFinal ? secciones[secciones.length - 1]?.id ?? "" : secciones[indice]?.id ?? "")
        }
        const alDesplazar = () => {
            if (!cuadro) cuadro = requestAnimationFrame(medir)
        }
        medir()
        window.addEventListener("scroll", alDesplazar, { passive: true })
        window.addEventListener("resize", alDesplazar)
        return () => {
            cancelAnimationFrame(cuadro)
            window.removeEventListener("scroll", alDesplazar)
            window.removeEventListener("resize", alDesplazar)
        }
    }, [secciones])

    const indiceActivo = secciones.findIndex((seccion) => seccion.id === activa)

    return (
        <nav aria-label="Secciones de la página" className="fixed left-6 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
            <div className="relative flex flex-col gap-9 py-1">
                <span className="absolute bottom-2 left-[5px] top-2 w-0.5 rounded-full bg-slate-400/30" />
                <span className="absolute left-[5px] top-2 w-0.5 rounded-full bg-brand transition-[height] duration-150 ease-out" style={{ height: `calc((100% - 1rem) * ${progreso})` }} />
                {secciones.map((seccion, indice) => {
                    const esActiva = seccion.id === activa
                    const recorrida = indice <= indiceActivo
                    return (
                        <a
                            key={seccion.id}
                            href={`#${seccion.id}`}
                            aria-current={esActiva ? "true" : undefined}
                            aria-label={seccion.titulo}
                            className="group relative flex items-center gap-3 outline-none"
                        >
                            <span className={`relative size-3 rounded-full ring-2 transition-all duration-200 ${recorrida ? "bg-brand ring-brand/30" : "bg-slate-400/60 ring-transparent"} ${esActiva ? "scale-150 ring-4" : "group-hover:scale-125"}`} />
                            <span className={`whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-sm ring-1 ring-black/5 transition-all duration-200 pointer-events-none -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100`}>
                                {seccion.titulo}
                            </span>
                        </a>
                    )
                })}
            </div>
        </nav>
    )
}
