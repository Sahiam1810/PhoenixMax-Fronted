import { Link, NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { enlaceWhatsApp } from "../lib/config"
import { IconoCarrito, IconoUsuario, IconoWhatsApp } from "./iconos"
import { MenuCuenta } from "./MenuCuenta"
import { Marca } from "./ui"

const base = "h-10 items-center gap-2 rounded-full px-4 text-sm font-bold shadow-sm ring-1 ring-black/5 transition-colors duration-150"
const clara = "bg-white text-ink hover:bg-brand-50"

export function Header() {
    const { usuario } = useAuth()
    const { contador } = useCart()

    return (
        <header className="sticky top-0 z-30 px-3 pt-3 sm:px-8 lg:px-12 xl:px-24">
            <nav className="mx-auto flex max-w-[96rem] items-center justify-between gap-2 rounded-2xl bg-brand px-3 py-2.5 shadow-sm sm:px-4">
                <Link to="/" aria-label="PhoenixMax, inicio" className="shrink-0">
                    <Marca />
                </Link>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <NavLink to="/catalogo" className={({ isActive }) => `${base} hidden sm:inline-flex ${isActive ? "bg-ink text-white" : clara}`}>
                        Catálogo
                    </NavLink>
                    <a href={enlaceWhatsApp()} target="_blank" rel="noreferrer" aria-label="Soporte por WhatsApp" className={`${base} ${clara} inline-flex px-2.5 md:px-4`}>
                        <span className="hidden md:inline">Soporte</span>
                        <IconoWhatsApp className="size-5 text-[#1fa855]" />
                    </a>
                    {usuario ? (
                        <MenuCuenta usuario={usuario} />
                    ) : (
                        <Link to="/login" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink pl-4 pr-1 text-sm font-bold text-white shadow-sm transition-colors duration-150 hover:bg-neutral-800">
                            Entrar
                            <span className="grid size-8 place-items-center rounded-full bg-brand text-ink">
                                <IconoUsuario className="size-4" />
                            </span>
                        </Link>
                    )}
                    {usuario?.rol === "cliente" && (
                        <Link to="/carrito" aria-label={`Carrito, ${contador} productos`} className="relative grid size-10 place-items-center rounded-full bg-white text-ink shadow-sm ring-1 ring-black/5 transition-colors duration-150 hover:bg-brand-50">
                            <IconoCarrito className="size-5" />
                            {contador > 0 && (
                                <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold leading-5 text-white">
                                    {contador}
                                </span>
                            )}
                        </Link>
                    )}
                </div>
            </nav>
        </header>
    )
}
