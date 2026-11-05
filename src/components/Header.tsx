import { Link, NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { enlaceWhatsApp } from "../lib/config"
import { IconoCarrito, IconoUsuario, IconoWhatsApp } from "./iconos"
import { MenuCuenta } from "./MenuCuenta"
import { Marca } from "./ui"

export function Header() {
    const { usuario } = useAuth()
    const { contador } = useCart()

    return (
        <header className="sticky top-0 z-20 bg-white/95 px-3 pt-3 backdrop-blur sm:px-6">
            <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-2xl bg-brand px-3 py-2 sm:px-5">
                <Link to="/" aria-label="PhoenixMax, inicio">
                    <Marca />
                </Link>
                <div className="flex items-center gap-1 sm:gap-3">
                    <NavLink to="/catalogo" className={({ isActive }) => `hidden rounded-full px-3 py-2 text-sm font-bold transition-colors hover:bg-black/5 sm:block ${isActive ? "underline underline-offset-4" : ""}`}>
                        Catálogo
                    </NavLink>
                    <a href={enlaceWhatsApp()} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full px-2 py-2 text-sm font-bold transition-colors hover:bg-black/5 sm:px-3">
                        <span className="hidden md:inline">Soporte</span>
                        <IconoWhatsApp className="size-6" />
                    </a>
                    {usuario ? (
                        <MenuCuenta usuario={usuario} />
                    ) : (
                        <Link to="/login" className="flex items-center gap-2 rounded-full py-1 pl-3 pr-1 text-sm font-bold transition-colors hover:bg-black/5">
                            Entrar
                            <span className="grid size-9 place-items-center rounded-full bg-ink text-white">
                                <IconoUsuario className="size-5" />
                            </span>
                        </Link>
                    )}
                    {usuario?.rol === "cliente" && (
                        <Link to="/carrito" aria-label={`Carrito, ${contador} productos`} className="relative grid size-10 place-items-center rounded-full transition-colors hover:bg-black/5">
                            <IconoCarrito className="size-6" />
                            {contador > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold leading-5 text-white">
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
