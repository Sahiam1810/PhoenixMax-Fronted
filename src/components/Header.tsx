import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"

export function Header() {
    const { usuario } = useAuth()
    const { contador } = useCart()
    return <header className="border-b bg-white"><nav className="mx-auto flex max-w-6xl items-center justify-between p-4"><Link to="/" className="text-xl font-bold text-brand">StreamStore</Link><div className="flex items-center gap-4 text-sm"><Link to="/catalogo">Catálogo</Link><Link to="/carrito" aria-label="Carrito">🛒 <span className="rounded-full bg-brand px-1.5 py-0.5 text-white">{contador}</span></Link><Link to={usuario ? "/mi-cuenta" : "/login"}>{usuario ? "Mi cuenta" : "Iniciar sesión"}</Link></div></nav></header>
}
