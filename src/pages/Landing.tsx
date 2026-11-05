import { Link } from "react-router-dom"
import { IconoEscudo, IconoRayo, IconoSoporte } from "../components/iconos"
import { ProductCard } from "../components/ProductCard"
import { Aviso, Cargando, LogoPlataforma, TituloSeccion } from "../components/ui"
import { useAuth } from "../context/AuthContext"
import { useCarga } from "../hooks/useCarga"
import { etiquetaCategoria } from "../lib/formato"
import { plataformasService } from "../services/plataformasService"
import { productosService } from "../services/productosService"
import type { Categoria } from "../types"

const cargarPlataformas = () => plataformasService.listar()
const cargarProductos = () => productosService.listar()

const categorias: Categoria[] = ["streaming", "ia", "edicion"]

const beneficios = [
    { icono: IconoEscudo, titulo: "Pago seguro", texto: "Tus credenciales se liberan solo cuando el pago está confirmado." },
    { icono: IconoSoporte, titulo: "Soporte técnico", texto: "Te acompañamos por WhatsApp durante todo tu servicio." },
    { icono: IconoRayo, titulo: "Entrega inmediata", texto: "Recibe tus accesos en tu panel apenas pagas." }
]

const pasos = [
    { titulo: "Elige", texto: "Explora el catálogo y escoge entre cuenta completa o pantalla individual." },
    { titulo: "Paga", texto: "Arma tu carrito con varios productos y paga en un solo paso." },
    { titulo: "Disfruta", texto: "Mira tus accesos en Mis servicios y te avisamos antes de que venzan." }
]

const preguntas = [
    { pregunta: "¿Qué diferencia hay entre cuenta completa y pantalla?", respuesta: "La cuenta completa te da el correo y la contraseña con todas sus pantallas. La pantalla es un perfil individual con PIN dentro de una cuenta compartida." },
    { pregunta: "¿Cuándo recibo mis datos de acceso?", respuesta: "Apenas se confirma el pago. Los encuentras en tu perfil, en la pestaña Mis servicios, con un botón para copiarlos." },
    { pregunta: "¿Cómo sé cuándo vence mi servicio?", respuesta: "Cada servicio muestra su fecha de vencimiento y los días restantes. Además te enviamos un correo 3 días antes, 1 día antes y el día que vence." },
    { pregunta: "¿Puedo comprar varios productos a la vez?", respuesta: "Sí. Agrega todo lo que necesites al carrito y paga una sola vez. Cada unidad genera su propio servicio con su vencimiento." },
    { pregunta: "¿Qué pasa si un producto se agota mientras pago?", respuesta: "El pago se cancela completo y te indicamos qué producto se agotó para que ajustes tu carrito. Nunca se cobra a medias." }
]

export function Landing() {
    const { usuario } = useAuth()
    const plataformas = useCarga(cargarPlataformas)
    const productos = useCarga(cargarProductos)
    const destacados = (productos.data ?? []).filter((item) => item.stock > 0).slice(0, 6)

    return (
        <div className="space-y-14 sm:space-y-20">
            <section className="rounded-3xl bg-ink px-6 py-12 text-white sm:px-12 sm:py-16">
                <h1 className="mx-auto max-w-3xl text-center text-2xl font-extrabold leading-tight sm:text-4xl">
                    Bienvenido al servicio de venta de cuentas más grande de Latinoamérica
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-center text-sm text-white/70 sm:text-base">
                    Streaming, inteligencia artificial y edición en un solo lugar, con entrega inmediata.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link to="/catalogo" className="rounded-lg bg-brand px-6 py-3 text-center text-sm font-bold text-ink transition-colors hover:bg-brand-600">Ver catálogo</Link>
                    {!usuario && <Link to="/registro" className="rounded-lg border border-white/30 px-6 py-3 text-center text-sm font-bold transition-colors hover:bg-white/10">Crear cuenta</Link>}
                </div>
                <ul className="mt-12 grid gap-6 sm:grid-cols-3">
                    {beneficios.map(({ icono: Icono, titulo, texto }) => (
                        <li key={titulo} className="text-center">
                            <Icono className="mx-auto size-7 text-brand" />
                            <p className="mt-3 text-lg font-semibold">{titulo}</p>
                            <p className="mt-1 text-sm text-white/60">{texto}</p>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <TituloSeccion>Categorías</TituloSeccion>
                <div className="grid grid-cols-3 gap-3 sm:mx-auto sm:max-w-2xl sm:gap-6">
                    {categorias.map((categoria) => (
                        <Link key={categoria} to={`/catalogo?categoria=${categoria}`} className="rounded-xl bg-suave py-4 text-center text-sm font-bold transition-colors duration-150 hover:bg-brand">
                            {etiquetaCategoria[categoria]}
                        </Link>
                    ))}
                </div>
            </section>

            <section>
                <TituloSeccion>Plataformas destacadas</TituloSeccion>
                {plataformas.cargando && <Cargando />}
                {plataformas.error && <Aviso tipo="error">{plataformas.error}</Aviso>}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 lg:grid-cols-7">
                    {(plataformas.data ?? []).map((plataforma) => (
                        <Link key={plataforma.id} to={`/catalogo?plataforma=${plataforma.id}`} className="transition-transform duration-150 hover:-translate-y-0.5">
                            <LogoPlataforma plataforma={plataforma} className="aspect-square rounded-2xl" />
                        </Link>
                    ))}
                </div>
            </section>

            <section>
                <TituloSeccion>Catálogo</TituloSeccion>
                {productos.cargando && <Cargando />}
                {productos.error && <Aviso tipo="error">{productos.error}</Aviso>}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {destacados.map((producto) => <ProductCard key={producto.id} producto={producto} />)}
                </div>
                <div className="mt-6 text-center">
                    <Link to="/catalogo" className="inline-block rounded-lg bg-ink px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-800">Ver todo el catálogo</Link>
                </div>
            </section>

            <section>
                <TituloSeccion>Cómo funciona</TituloSeccion>
                <ol className="grid gap-4 sm:grid-cols-3">
                    {pasos.map((paso, indice) => (
                        <li key={paso.titulo} className="rounded-2xl border border-slate-200 p-6">
                            <span className="grid size-10 place-items-center rounded-full bg-brand text-lg font-extrabold">{indice + 1}</span>
                            <p className="mt-4 text-lg font-bold">{paso.titulo}</p>
                            <p className="mt-1 text-sm text-slate-600">{paso.texto}</p>
                        </li>
                    ))}
                </ol>
            </section>

            <section id="preguntas" className="scroll-mt-24">
                <TituloSeccion>Preguntas frecuentes</TituloSeccion>
                <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
                    {preguntas.map((item) => (
                        <details key={item.pregunta} className="group px-5 py-4">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                                {item.pregunta}
                                <span className="text-xl leading-none text-slate-400 transition-transform duration-150 group-open:rotate-45">+</span>
                            </summary>
                            <p className="mt-3 text-sm text-slate-600">{item.respuesta}</p>
                        </details>
                    ))}
                </div>
            </section>
        </div>
    )
}
