import { Link } from "react-router-dom"
import { enlaceWhatsApp } from "../lib/config"
import { Contenedor, Marca } from "./ui"

export function Footer() {
    return (
        <footer className="mt-24 bg-brand text-ink">
            <Contenedor className="grid gap-10 py-12 sm:grid-cols-3">
                <div>
                    <Marca />
                    <p className="mt-3 max-w-xs text-sm">Cuentas y pantallas de streaming, IA y edición con entrega inmediata y soporte real.</p>
                </div>
                <div>
                    <p className="text-sm font-bold uppercase tracking-wide">Tienda</p>
                    <ul className="mt-3 space-y-2 text-sm">
                        <li><Link to="/catalogo" className="hover:underline">Catálogo</Link></li>
                        <li><Link to="/carrito" className="hover:underline">Carrito</Link></li>
                        <li><Link to="/perfil" className="hover:underline">Mis servicios</Link></li>
                    </ul>
                </div>
                <div>
                    <p className="text-sm font-bold uppercase tracking-wide">Ayuda</p>
                    <ul className="mt-3 space-y-2 text-sm">
                        <li><Link to="/#preguntas" className="hover:underline">Preguntas frecuentes</Link></li>
                        <li><a href={enlaceWhatsApp()} target="_blank" rel="noreferrer" className="hover:underline">Soporte por WhatsApp</a></li>
                    </ul>
                </div>
            </Contenedor>
            <div className="border-t border-black/10">
                <Contenedor className="py-4 text-xs">© {new Date().getFullYear()} PhoenixMax · Proyecto formativo, todos los datos son ficticios.</Contenedor>
            </div>
        </footer>
    )
}
