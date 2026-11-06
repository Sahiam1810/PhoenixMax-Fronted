import { useCallback, useEffect, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { IconoAtras, IconoCheck } from "../components/iconos"
import { Aviso, Boton, Cargando, Insignia, LogoPlataforma, SelectorCantidad } from "../components/ui"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { useCarga } from "../hooks/useCarga"
import { duracion, etiquetaCategoria, etiquetaTipo, precio } from "../lib/formato"
import { mensajeError } from "../services/http"
import { productosService } from "../services/productosService"
import type { Producto } from "../types"

function queRecibes(producto: Producto) {
    if (producto.tipo === "cuenta") {
        return [
            "Correo y contraseña de la cuenta",
            `Las ${producto.plataforma.maxPantallas} pantallas son solo tuyas`,
            "Puedes crear y renombrar perfiles",
            `Vigencia de ${duracion(producto.duracionDias)} desde el pago`
        ]
    }
    return [
        "Correo y contraseña de acceso",
        "Un perfil asignado con su PIN",
        "Usa la pantalla en 1 dispositivo a la vez",
        `Vigencia de ${duracion(producto.duracionDias)} desde el pago`
    ]
}

export function DetalleProducto() {
    const { id } = useParams()
    const productoId = Number(id)
    const navigate = useNavigate()
    const location = useLocation()
    const { usuario } = useAuth()
    const { carrito, agregar } = useCart()
    const [cantidad, setCantidad] = useState(1)
    const [agregando, setAgregando] = useState(false)
    const [error, setError] = useState("")
    const [exito, setExito] = useState("")

    const cargarProducto = useCallback(() => productosService.obtener(productoId), [productoId])
    const { data: producto, cargando, error: errorCarga } = useCarga(cargarProducto)
    const plataformaId = producto?.plataformaId
    const cargarVariantes = useCallback(() => productosService.listar({ plataforma: plataformaId }), [plataformaId])
    const variantes = useCarga(cargarVariantes)

    useEffect(() => {
        setCantidad(1)
        setError("")
        setExito("")
    }, [productoId])

    if (cargando) return <Cargando />
    if (errorCarga || !producto) {
        return (
            <div className="space-y-4">
                <Aviso tipo="error">{errorCarga || "Producto no encontrado"}</Aviso>
                <Link to="/catalogo" className="text-sm font-semibold underline">Volver al catálogo</Link>
            </div>
        )
    }

    const enCarrito = carrito.items.find((item) => item.producto.id === producto.id)?.cantidad ?? 0
    const disponible = Math.max(0, producto.stock - enCarrito)
    const agotado = producto.stock === 0
    const otras = (variantes.data ?? []).filter((item) => plataformaId !== undefined && item.plataformaId === plataformaId)
    const pantallas = producto.plataforma.maxPantallas
    const pantallaPar = otras.find((item) => item.tipo === "pantalla" && item.duracionDias === producto.duracionDias)
    const cuentaPar = otras.find((item) => item.tipo === "cuenta" && item.duracionDias === producto.duracionDias)
    const precioPantallas = producto.tipo === "cuenta" && pantallaPar ? pantallaPar.precio * pantallas : producto.precio * pantallas
    const precioCuenta = producto.tipo === "cuenta" ? producto.precio : cuentaPar?.precio
    const ahorro = precioCuenta !== undefined ? precioPantallas - precioCuenta : 0

    const alAgregar = async () => {
        if (!usuario) {
            navigate("/login", { state: { desde: location.pathname } })
            return
        }
        setAgregando(true)
        setError("")
        setExito("")
        try {
            await agregar(producto.id, cantidad)
            setExito(`Agregaste ${cantidad} ${cantidad === 1 ? "unidad" : "unidades"} al carrito`)
            setCantidad(1)
        } catch (fallo) {
            setError(mensajeError(fallo))
        } finally {
            setAgregando(false)
        }
    }

    return (
        <div>
            <Link to="/catalogo" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-slate-600 hover:text-ink dark:text-neutral-400 dark:hover:text-white">
                <IconoAtras className="size-4" />
                Volver al catálogo
            </Link>
            <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-4">
                    <LogoPlataforma plataforma={producto.plataforma} tamano="grande" className="aspect-[4/3] rounded-3xl" />
                    <p className="text-sm text-slate-600 dark:text-neutral-300">{producto.plataforma.descripcion}</p>
                </div>
                <div className="space-y-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Insignia>{etiquetaCategoria[producto.plataforma.categoria]}</Insignia>
                            {agotado && <Insignia className="bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">Agotado</Insignia>}
                        </div>
                        <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl text-ink dark:text-white">{producto.plataforma.nombre}</h1>
                        <p className="text-slate-600 dark:text-neutral-400">{etiquetaTipo[producto.tipo]} · {duracion(producto.duracionDias)}</p>
                        <p className="mt-4 text-3xl font-extrabold text-ink dark:text-white">{precio(producto.precio)}</p>
                        {ahorro > 0 && precioCuenta !== undefined && (
                            <p className="mt-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                {producto.tipo === "cuenta"
                                    ? <>Equivale a {pantallas} pantallas ({precio(precioPantallas)}). <strong>Ahorras {precio(ahorro)}.</strong></>
                                    : <>¿Necesitas las {pantallas} pantallas? La cuenta completa cuesta {precio(precioCuenta)} y <strong>ahorras {precio(ahorro)}</strong>.</>}
                            </p>
                        )}
                    </div>

                    {otras.length > 1 && (
                        <div>
                            <p className="mb-2 text-sm font-semibold text-ink dark:text-white">Elige la modalidad</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {otras.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={`/producto/${item.id}`}
                                        replace
                                        className={`rounded-xl border-2 p-3 transition-colors duration-150 ${item.id === producto.id ? "border-ink bg-slate-50 dark:border-brand dark:bg-neutral-800" : "border-slate-200 dark:border-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600"}`}
                                    >
                                        <p className="text-sm font-bold text-ink dark:text-white">{etiquetaTipo[item.tipo]}</p>
                                        <p className="text-xs text-slate-500 dark:text-neutral-400">{duracion(item.duracionDias)} · {precio(item.precio)}</p>
                                        <p className={`mt-1 text-xs font-semibold ${item.stock === 0 ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-neutral-400"}`}>{item.stock === 0 ? "Agotado" : `${item.stock} ${item.stock === 1 ? "disponible" : "disponibles"}`}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="rounded-2xl bg-slate-50 p-5">
                        <p className="text-sm font-bold">Qué recibes</p>
                        <ul className="mt-3 space-y-2">
                            {queRecibes(producto).map((texto) => (
                                <li key={texto} className="flex items-start gap-2 text-sm text-slate-700">
                                    <IconoCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    {texto}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {usuario?.rol === "admin" ? (
                        <Aviso tipo="info">Estás en modo administrador. Las compras se hacen con una cuenta de cliente.</Aviso>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold">Cantidad</p>
                                    <p className={`text-xs ${producto.stock <= 2 ? "font-semibold text-amber-700" : "text-slate-500"}`}>
                                        {agotado ? "Sin unidades disponibles" : `Stock: ${producto.stock}${enCarrito ? ` · ${enCarrito} en tu carrito` : ""}`}
                                    </p>
                                </div>
                                <SelectorCantidad valor={cantidad} maximo={Math.max(1, usuario ? disponible : producto.stock)} onCambio={setCantidad} deshabilitado={agotado} />
                            </div>
                            <Boton className="w-full py-3.5" onClick={alAgregar} cargando={agregando} disabled={agotado || (usuario !== null && disponible === 0)}>
                                {agotado ? "Agotado" : usuario && disponible === 0 ? "Ya tienes todo el stock en tu carrito" : `Agregar al carrito · ${precio(producto.precio * cantidad)}`}
                            </Boton>
                            {!usuario && !agotado && <p className="text-center text-xs text-slate-500">Te pediremos iniciar sesión para agregar al carrito.</p>}
                            {error && <Aviso tipo="error">{error}</Aviso>}
                            {exito && (
                                <Aviso tipo="exito">
                                    {exito}. <Link to="/carrito" className="font-bold underline">Ir al carrito</Link>
                                </Aviso>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
