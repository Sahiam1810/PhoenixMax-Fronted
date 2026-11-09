import { useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ServiceCard } from "../components/ServiceCard"
import { Aviso, Boton, Campo, Cargando, Insignia, Vacio } from "../components/ui"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { useCarga } from "../hooks/useCarga"
import { duracion, estadoServicio, etiquetaEstadoCompra, etiquetaTipo, formatoFecha, formatoFechaHora, iniciales, precio } from "../lib/formato"
import { authService } from "../services/authService"
import { comprasService } from "../services/comprasService"
import { mensajeError } from "../services/http"
import { serviciosService } from "../services/serviciosService"
import type { EstadoCompra, EstadoVisualServicio, Servicio, Usuario } from "../types"

type Pestana = "servicios" | "compras" | "datos"

const cargarServicios = () => serviciosService.mios()
const cargarCompras = () => comprasService.mias()

const coloresCompra: Record<EstadoCompra, string> = {
    pagada: "bg-emerald-100 text-emerald-800",
    pendiente: "bg-amber-100 text-amber-800",
    cancelada: "bg-slate-200 text-slate-700"
}

function MisServicios() {
    const { data, cargando, error } = useCarga(cargarServicios)
    const [filtro, setFiltro] = useState<EstadoVisualServicio | "todos">("todos")
    const { carrito, agregar } = useCart()
    const navigate = useNavigate()
    const renovar = async (servicio: Servicio) => {
        await agregar(servicio.productoId, 1, servicio.id)
        navigate("/carrito")
    }
    if (cargando) return <Cargando texto="Cargando tus servicios..." />
    if (error) return <Aviso tipo="error">{error}</Aviso>
    const servicios = data ?? []
    if (servicios.length === 0) {
        return (
            <Vacio titulo="Aún no tienes servicios">
                <p>Cuando pagues una compra, tus accesos aparecerán aquí.</p>
                <Link to="/catalogo" className="mt-4 inline-block rounded-lg bg-ink px-5 py-2.5 font-semibold text-white">Ir al catálogo</Link>
            </Vacio>
        )
    }
    const conteo = (estado: EstadoVisualServicio) => servicios.filter((item) => estadoServicio(item) === estado).length
    const visibles = servicios.filter((item) => filtro === "todos" || estadoServicio(item) === filtro)
    const opciones: Array<[EstadoVisualServicio | "todos", string]> = [
        ["todos", `Todos (${servicios.length})`],
        ["activo", `Activos (${conteo("activo")})`],
        ["por_vencer", `Por vencer (${conteo("por_vencer")})`],
        ["vencido", `Vencidos (${conteo("vencido")})`]
    ]
    return (
        <div className="space-y-4">
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                {opciones.map(([valor, texto]) => (
                    <button key={valor} type="button" onClick={() => setFiltro(valor)} aria-pressed={filtro === valor} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${filtro === valor ? "border-ink bg-ink text-white dark:border-brand dark:bg-brand dark:text-ink font-bold" : "border-slate-300 dark:border-neutral-700 dark:text-neutral-300 hover:border-ink dark:hover:border-neutral-400"}`}>
                        {texto}
                    </button>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {visibles.map((servicio) => <ServiceCard key={servicio.id} servicio={servicio} enCarrito={carrito.items.some((item) => item.servicioId === servicio.id)} alRenovar={() => void renovar(servicio)} />)}
            </div>
        </div>
    )
}

function MisCompras() {
    const { data, cargando, error } = useCarga(cargarCompras)
    if (cargando) return <Cargando texto="Cargando tus compras..." />
    if (error) return <Aviso tipo="error">{error}</Aviso>
    const compras = data ?? []
    if (compras.length === 0) return <Vacio titulo="Aún no tienes compras" />
    return (
        <ul className="space-y-3">
            {compras.map((compra) => (
                <li key={compra.id}>
                    <details className="group rounded-2xl border border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4">
                            <div>
                                <p className="font-bold text-ink dark:text-white">Pedido #{compra.id}</p>
                                <p className="text-xs text-slate-500 dark:text-neutral-400">{formatoFechaHora(compra.createdAt)} · {compra.items.length} {compra.items.length === 1 ? "producto" : "productos"}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Insignia className={coloresCompra[compra.estado]}>{etiquetaEstadoCompra[compra.estado]}</Insignia>
                                <p className="font-extrabold text-ink dark:text-white">{precio(compra.total)}</p>
                                <span className="text-slate-400 transition-transform duration-150 group-open:rotate-180">▾</span>
                            </div>
                        </summary>
                        <div className="border-t border-slate-100 dark:border-neutral-800 px-4 pb-4">
                            <table className="mt-3 w-full text-left text-sm">
                                <thead className="text-xs text-slate-500 dark:text-neutral-400">
                                    <tr>
                                        <th className="py-1 font-semibold">Producto</th>
                                        <th className="py-1 text-center font-semibold">Cant.</th>
                                        <th className="hidden py-1 text-right font-semibold sm:table-cell">Unitario</th>
                                        <th className="py-1 text-right font-semibold">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compra.items.map((item) => (
                                        <tr key={item.id} className="border-t border-slate-100 dark:border-neutral-800">
                                            <td className="py-2">
                                                <p className="font-semibold text-ink dark:text-white">{item.producto.plataforma.nombre}</p>
                                                <p className="text-xs text-slate-500 dark:text-neutral-400">{etiquetaTipo[item.producto.tipo]} · {duracion(item.producto.duracionDias)}</p>
                                            </td>
                                            <td className="py-2 text-center text-ink dark:text-neutral-200">{item.cantidad}</td>
                                            <td className="hidden py-2 text-right sm:table-cell text-slate-600 dark:text-neutral-400">{precio(item.precioUnitario)}</td>
                                            <td className="py-2 text-right font-semibold text-ink dark:text-white">{precio(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {compra.pagadaAt && <p className="mt-3 text-xs text-slate-500 dark:text-neutral-400">Pagada el {formatoFecha(compra.pagadaAt)}</p>}
                        </div>
                    </details>
                </li>
            ))}
        </ul>
    )
}

function MisDatos({ usuario }: { usuario: Usuario }) {
    const { actualizarUsuario } = useAuth()
    const [nombre, setNombre] = useState(usuario.nombre)
    const [telefono, setTelefono] = useState(usuario.telefono)
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error", texto: string } | null>(null)

    const guardar = async (evento: FormEvent) => {
        evento.preventDefault()
        if (nombre.trim().length < 3) {
            setMensaje({ tipo: "error", texto: "El nombre debe tener al menos 3 caracteres" })
            return
        }
        setGuardando(true)
        setMensaje(null)
        try {
            const respuesta = await authService.actualizarPerfil({ nombre, telefono })
            actualizarUsuario(respuesta.data)
            setMensaje({ tipo: "exito", texto: respuesta.message })
        } catch (fallo) {
            setMensaje({ tipo: "error", texto: mensajeError(fallo) })
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={guardar} className="max-w-md space-y-4">
            <Campo etiqueta="Nombre" name="nombre" value={nombre} onChange={(evento) => setNombre(evento.target.value)} />
            <Campo etiqueta="Correo" name="email" value={usuario.email} disabled />
            <Campo etiqueta="WhatsApp" name="telefono" type="tel" value={telefono} onChange={(evento) => setTelefono(evento.target.value)} />
            {mensaje && <Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso>}
            <Boton type="submit" cargando={guardando}>Guardar cambios</Boton>
        </form>
    )
}

export function Perfil() {
    const { usuario } = useAuth()
    const [params, setParams] = useSearchParams()
    if (!usuario) return null
    const esCliente = usuario.rol === "cliente"
    const pestanas: Array<[Pestana, string]> = esCliente
        ? [["servicios", "Mis servicios"], ["compras", "Mis compras"], ["datos", "Mis datos"]]
        : [["datos", "Mis datos"]]
    const solicitada = params.get("tab")
    const activa = pestanas.find(([clave]) => clave === solicitada)?.[0] ?? pestanas[0][0]

    return (
        <div>
            <div className="mb-6 flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-ink text-lg font-bold text-white">{iniciales(usuario.nombre)}</span>
                <div className="min-w-0">
                    <h1 className="truncate text-xl font-extrabold sm:text-2xl">{usuario.nombre}</h1>
                    <p className="truncate text-sm text-slate-500">{usuario.email}</p>
                </div>
            </div>
            <div role="tablist" className="mb-6 flex gap-1 border-b border-slate-200 dark:border-neutral-800">
                {pestanas.map(([clave, texto]) => (
                    <button
                        key={clave}
                        type="button"
                        role="tab"
                        aria-selected={activa === clave}
                        onClick={() => setParams({ tab: clave }, { replace: true })}
                        className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4 ${activa === clave ? "border-ink text-ink dark:border-brand dark:text-brand" : "border-transparent text-slate-500 hover:text-ink dark:text-neutral-400 dark:hover:text-white"}`}
                    >
                        {texto}
                    </button>
                ))}
            </div>
            {activa === "servicios" && <MisServicios />}
            {activa === "compras" && <MisCompras />}
            {activa === "datos" && <MisDatos usuario={usuario} />}
        </div>
    )
}
