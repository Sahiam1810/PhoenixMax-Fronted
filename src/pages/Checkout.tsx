import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { IconoAtras, IconoCheck } from "../components/iconos"
import { Aviso, Boton, LogoPlataforma } from "../components/ui"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { duracion, etiquetaTipo, precio } from "../lib/formato"
import { comprasService } from "../services/comprasService"
import { mensajeError } from "../services/http"
import type { Compra, Producto } from "../types"

const metodos = [
    { id: "tarjeta", nombre: "Tarjeta de crédito o débito", detalle: "Pago simulado · aprobación inmediata" },
    { id: "bre-b", nombre: "Llave Bre-B", detalle: "Pago simulado · confirmación automática" },
    { id: "nequi", nombre: "Nequi", detalle: "Pago simulado · confirmación automática" }
]

interface LineaResumen {
    id: number
    producto: Producto
    cantidad: number
    subtotal: number
    esRenovacion?: boolean
}

function Resumen({ lineas, total }: { lineas: LineaResumen[], total: number }) {
    return (
        <div>
            <ul className="divide-y divide-slate-100">
                {lineas.map((linea) => (
                    <li key={linea.id} className="flex items-center gap-3 py-3">
                        <LogoPlataforma plataforma={linea.producto.plataforma} tamano="mini" className="size-12 shrink-0 rounded-lg" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{linea.esRenovacion ? `Renovación · ${linea.producto.plataforma.nombre}` : linea.producto.plataforma.nombre}</p>
                            <p className="text-xs text-slate-500">{etiquetaTipo[linea.producto.tipo]} · {duracion(linea.producto.duracionDias)} · x{linea.cantidad}</p>
                        </div>
                        <p className="text-sm font-semibold">{precio(linea.subtotal)}</p>
                    </li>
                ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="font-semibold">Total</p>
                <p className="text-2xl font-extrabold">{precio(total)}</p>
            </div>
        </div>
    )
}

export function Checkout() {
    const { usuario } = useAuth()
    const { carrito, recargar } = useCart()
    const [compra, setCompra] = useState<Compra | null>(null)
    const [metodo, setMetodo] = useState(metodos[0].id)
    const [procesando, setProcesando] = useState(false)
    const [error, setError] = useState("")

    if (!compra && carrito.items.length === 0) return <Navigate to="/carrito" replace />

    const confirmar = async () => {
        setProcesando(true)
        setError("")
        try {
            const { data } = await comprasService.crear()
            setCompra(data)
        } catch (fallo) {
            setError(mensajeError(fallo))
        } finally {
            setProcesando(false)
        }
    }

    const pagar = async () => {
        if (!compra) return
        setProcesando(true)
        setError("")
        try {
            const { data } = await comprasService.pagar(compra.id, metodo)
            setCompra(data)
        } catch (fallo) {
            setError(mensajeError(fallo))
        } finally {
            setProcesando(false)
            recargar().catch(() => undefined)
        }
    }

    if (compra?.estado === "pagada") {
        return (
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center sm:p-10 dark:border-neutral-800 dark:bg-neutral-900">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <IconoCheck className="size-8" />
                </span>
                <h1 className="mt-4 text-2xl font-extrabold text-ink dark:text-white">¡Compra exitosa!</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-neutral-300">
                    Gracias, {usuario?.nombre.split(" ")[0]}. Tu pedido #{compra.id} fue pagado y tus accesos ya están disponibles.
                </p>
                <div className="mt-6 text-left">
                    <Resumen
                        total={compra.total}
                        lineas={compra.items}
                    />
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link to="/perfil" className="rounded-lg bg-ink px-5 py-3 text-sm font-bold text-white hover:bg-neutral-800 dark:bg-brand dark:text-ink">Ver mis servicios</Link>
                    <Link to="/catalogo" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold hover:bg-slate-50 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800">Seguir comprando</Link>
                </div>
            </div>
        )
    }

    const lineas: LineaResumen[] = compra ? compra.items : carrito.items

    return (
        <div>
            <Link to="/carrito" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-slate-600 hover:text-ink dark:text-neutral-400 dark:hover:text-white">
                <IconoAtras className="size-4" />
                Volver al carrito
            </Link>
            <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
                <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h1 className="text-xl font-extrabold sm:text-2xl text-ink dark:text-white">Resumen del pedido</h1>
                        {compra && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">Pedido #{compra.id} · Pendiente de pago</span>}
                    </div>
                    <div className="mt-4">
                        <Resumen lineas={lineas} total={compra?.total ?? carrito.total} />
                    </div>
                </section>
                <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 lg:self-start dark:border-neutral-800 dark:bg-neutral-900">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-neutral-400">Paso {compra ? "2" : "1"} de 2</p>
                        <h2 className="mt-1 font-bold text-ink dark:text-white">{compra ? "Elige cómo pagar" : "Confirma tu pedido"}</h2>
                    </div>
                    {compra ? (
                        <fieldset className="space-y-2">
                            <legend className="sr-only">Método de pago</legend>
                            {metodos.map((item) => (
                                <label key={item.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-colors duration-150 ${metodo === item.id ? "border-ink bg-slate-50 dark:border-brand dark:bg-neutral-800" : "border-slate-200 dark:border-neutral-700 hover:border-slate-400 dark:hover:border-neutral-600"}`}>
                                    <input type="radio" name="metodo" value={item.id} checked={metodo === item.id} onChange={() => setMetodo(item.id)} className="accent-brand" />
                                    <span>
                                        <span className="block text-sm font-bold text-ink dark:text-white">{item.nombre}</span>
                                        <span className="block text-xs text-slate-500 dark:text-neutral-400">{item.detalle}</span>
                                    </span>
                                </label>
                            ))}
                        </fieldset>
                    ) : (
                        <p className="text-sm text-slate-600 dark:text-neutral-300">Al confirmar se crea tu pedido con los precios actuales. El stock se valida al momento de pagar.</p>
                    )}
                    {error && (
                        <Aviso tipo="error">
                            {error}
                            {compra && <Link to="/carrito" className="mt-2 block font-bold underline">Ajustar mi carrito</Link>}
                        </Aviso>
                    )}
                    {compra ? (
                        <Boton className="w-full py-3.5" variante="marca" cargando={procesando} onClick={pagar}>Pagar {precio(compra.total)}</Boton>
                    ) : (
                        <Boton className="w-full py-3.5" cargando={procesando} onClick={confirmar}>Confirmar pedido</Boton>
                    )}
                    <p className="text-center text-xs text-slate-500 dark:text-neutral-400">Pago simulado para la demo. No se realizan cobros reales.</p>
                </aside>
            </div>
        </div>
    )
}
