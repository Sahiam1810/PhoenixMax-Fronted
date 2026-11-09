import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { iniciales } from "../lib/formato"
import type { Usuario } from "../types"
import { IconoChevron } from "./iconos"

interface Opcion {
    texto: string
    ruta: string
}

function opcionesPara(usuario: Usuario): Opcion[] {
    if (usuario.rol === "admin") {
        return [
            { texto: "Perfil", ruta: "/perfil" },
            { texto: "Panel de administración", ruta: "/admin" }
        ]
    }
    return [{ texto: "Perfil", ruta: "/perfil" }]
}

export function MenuCuenta({ usuario }: { usuario: Usuario }) {
    const { cerrarSesion } = useAuth()
    const navigate = useNavigate()
    const [abierto, setAbierto] = useState(false)
    const contenedor = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!abierto) return
        const alClic = (evento: MouseEvent) => {
            if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false)
        }
        const alTecla = (evento: KeyboardEvent) => {
            if (evento.key === "Escape") setAbierto(false)
        }
        document.addEventListener("mousedown", alClic)
        document.addEventListener("keydown", alTecla)
        return () => {
            document.removeEventListener("mousedown", alClic)
            document.removeEventListener("keydown", alTecla)
        }
    }, [abierto])

    const salir = () => {
        setAbierto(false)
        cerrarSesion()
        navigate("/")
    }

    return (
        <div className="relative" ref={contenedor}>
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={abierto}
                onClick={() => setAbierto((valor) => !valor)}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white pl-1 pr-2.5 text-ink shadow-sm ring-1 ring-black/5 transition-colors duration-150 hover:bg-brand-50 sm:pl-4"
            >
                <span className="hidden max-w-32 truncate text-sm font-bold sm:inline">{usuario.nombre.split(" ")[0]}</span>
                <span className="grid size-8 place-items-center rounded-full bg-ink text-xs font-bold text-white">{iniciales(usuario.nombre)}</span>
                <IconoChevron className={`size-4 transition-transform duration-150 ${abierto ? "rotate-180" : ""}`} />
            </button>
            {abierto && (
                <div role="menu" className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:text-white">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-neutral-800">
                        <p className="truncate text-sm font-bold">{usuario.nombre}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-neutral-400">{usuario.email}</p>
                    </div>
                    {opcionesPara(usuario).map((opcion) => (
                        <Link key={opcion.ruta} role="menuitem" to={opcion.ruta} onClick={() => setAbierto(false)} className="block px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-neutral-800">
                            {opcion.texto}
                        </Link>
                    ))}
                    <button type="button" role="menuitem" onClick={salir} className="block w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:border-neutral-800 dark:hover:bg-red-950/30">
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    )
}
