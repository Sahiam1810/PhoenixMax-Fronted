import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { IconoAtras, IconoBasura, IconoBolsa } from "../components/iconos"
import { Aviso, Boton, Cargando, LogoPlataforma, SelectorCantidad, Vacio } from "../components/ui"
import { useCart } from "../context/CartContext"
import { duracion, etiquetaTipo, precio } from "../lib/formato"
import { mensajeError } from "../services/http"
import type { CarritoItem } from "../types"

function problemaStock(item: CarritoItem) {
    if (item.esRenovacion) return ""
    if (item.producto.stock === 0) return "Este producto se agotó. Quítalo para continuar."
    if (item.cantidad > item.producto.stock) return `Solo quedan ${item.producto.stock} unidades. Ajusta la cantidad.`
    return ""
}

export function Carrito() {
    const { carrito, contador, cargando, actualizar, eliminar, vaciar } = useCart()
    const navigate = useNavigate()
    const [ocupado, setOcupado] = useState<number | "todo" | null>(null)
    const [error, setError] = useState("")

    const ejecutar = async (clave: number | "todo", accion: () => Promise<string>) => {
        setOcupado(clave)
        setError("")
        try {
            await accion()
        } catch (fallo) {
            setError(mensajeError(fallo))
        } finally {
            setOcupado(null)
        }
    }

    if (cargando && carrito.items.length === 0) return <Cargando texto="Cargando tu carrito..." />

    const hayProblemas = carrito.items.some((item) => problemaStock(item) !== "")

    return (
        <div>
            <Link to="/catalogo" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-slate-600 hover:text-ink dark:text-neutral-400 dark:hover:text-white">
                <IconoAtras className="size-4" />
                Volver a la tienda
            </Link>
            {carrito.items.length === 0 ? (
                <Vacio titulo="Tu carrito está vacío">
                    <p>Explora el catálogo y agrega tus plataformas favoritas.</p>
                    <Link to="/catalogo" className="mt-4 inline-block rounded-lg bg-ink px-5 py-2.5 font-semibold text-white dark:bg-brand dark:text-ink">Ir al catálogo</Link>
                </Vacio>
            ) : (
                <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[1fr_22rem] dark:border-neutral-800 dark:bg-neutral-900">
                    <section>
                        <h1 className="flex items-center gap-2 text-xl font-extrabold sm:text-2xl text-ink dark:text-white">
                            <IconoBolsa className="size-6 text-brand-700 dark:text-brand" />
                            Resumen de compra
                        </h1>
                        <ul className="mt-4 divide-y divide-slate-100 dark:divide-neutral-800">
                            {carrito.items.map((item) => {
                                const problema = problemaStock(item)
                                return (
                                    <li key={item.id} className="py-4">
                                        <div className="flex gap-3">
                                            <LogoPlataforma plataforma={item.producto.plataforma} tamano="mini" className="size-16 shrink-0 rounded-xl" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        {item.esRenovacion && <p className="block truncate text-sm font-bold uppercase text-ink dark:text-white">Renovación · {item.producto.plataforma.nombre} · {item.servicio?.nombrePerfil ?? item.servicio?.emailAcceso ?? etiquetaTipo[item.producto.tipo]}</p>}
                                                        {!item.esRenovacion && <Link to={`/producto/${item.producto.id}`} className="block truncate text-sm font-bold uppercase hover:underline text-ink dark:text-white">{item.producto.plataforma.nombre}</Link>}
                                                        <p className="text-xs text-slate-500 dark:text-neutral-400">{etiquetaTipo[item.producto.tipo]} · {duracion(item.producto.duracionDias)}</p>
                                                        <p className="text-sm font-semibold text-brand-700 dark:text-brand">{precio(item.producto.precio)}</p>
                                                    </div>
                                                    <button type="button" aria-label={`Quitar ${item.producto.plataforma.nombre}`} onClick={() => ejecutar(item.id, () => eliminar(item.id))} disabled={ocupado !== null} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 disabled:opacity-40">
                                                        <IconoBasura className="size-4" />
                                                    </button>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between gap-2">
                                                    {!item.esRenovacion && <SelectorCantidad
                                                        valor={item.cantidad}
                                                        maximo={Math.max(item.producto.stock, 1)}
                                                        deshabilitado={ocupado !== null}
                                                        onCambio={(valor) => ejecutar(item.id, () => actualizar(item.id, valor))}
                                                    />}
                                                    <p className="text-sm font-bold text-ink dark:text-white">{precio(item.subtotal)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {problema && (
                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                                                <span>{problema}</span>
                                                {item.producto.stock > 0 && (
                                                    <button type="button" disabled={ocupado !== null} onClick={() => ejecutar(item.id, () => actualizar(item.id, item.producto.stock))} className="underline">
                                                        Ajustar a {item.producto.stock}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                        <Boton variante="peligro" className="mt-2 -ml-2" disabled={ocupado !== null} onClick={() => ejecutar("todo", vaciar)}>
                            <IconoBasura className="size-4" />
                            Vaciar carrito
                        </Boton>
                    </section>
                    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                        <div className="rounded-2xl bg-slate-50 dark:bg-neutral-800 p-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="font-semibold text-slate-700 dark:text-neutral-200">Total del pedido</p>
                                <p className="text-2xl font-extrabold text-brand-700 dark:text-brand">{precio(carrito.total)}</p>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{contador} {contador === 1 ? "producto" : "productos"} · Precios en COP</p>
                        </div>
                        {error && <Aviso tipo="error">{error}</Aviso>}
                        {hayProblemas && <Aviso tipo="alerta">Hay productos sin stock suficiente. Ajusta tu carrito para continuar.</Aviso>}
                        <Boton className="w-full py-3.5" disabled={hayProblemas || ocupado !== null} onClick={() => navigate("/checkout")}>
                            Ir a pagar
                        </Boton>
                        <p className="text-center text-xs text-slate-500 dark:text-neutral-400">El stock se confirma al momento del pago.</p>
                    </aside>
                </div>
            )}
        </div>
    )
}
