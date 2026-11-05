import { Link } from "react-router-dom"
import { IconoEscudo, IconoRayo, IconoSoporte } from "../components/iconos"
import { Contenedor, FondoImagen, TituloSeccion } from "../components/ui"
import { VistaCatalogo } from "../components/VistaCatalogo"
import { useAuth } from "../context/AuthContext"

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

    return (
        <div>
            <FondoImagen src="/img/hero.jpg" className="-mt-[4.5rem] text-white">
                <Contenedor className="pb-16 pt-36 sm:pb-24 sm:pt-48">
                    <h1 className="mx-auto max-w-4xl text-center font-display text-4xl leading-[1.1] sm:text-6xl">
                        Bienvenido al servicio de venta de cuentas más grande de Latinoamérica
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-center text-white/75 sm:text-lg">
                        Streaming, inteligencia artificial y edición en un solo lugar, con entrega inmediata.
                    </p>
                    <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                        <a href="#catalogo" className="rounded-full bg-brand px-7 py-3 text-center text-sm font-bold text-ink transition-colors hover:bg-brand-600">Ver catálogo</a>
                        {!usuario && <Link to="/registro" className="rounded-full bg-white px-7 py-3 text-center text-sm font-bold text-ink transition-colors hover:bg-brand-50">Crear cuenta</Link>}
                    </div>

                    <ul className="mt-20 grid gap-8 border-t border-white/15 pt-12 sm:grid-cols-3">
                        {beneficios.map(({ icono: Icono, titulo, texto }) => (
                            <li key={titulo} className="text-center sm:text-left">
                                <Icono className="mx-auto size-7 text-brand sm:mx-0" />
                                <p className="mt-3 text-lg font-semibold">{titulo}</p>
                                <p className="mt-1 text-sm text-white/60">{texto}</p>
                            </li>
                        ))}
                    </ul>

                    <div id="como-funciona" className="mt-20 scroll-mt-24">
                        <h2 className="text-center font-display text-3xl sm:text-4xl">Cómo funciona</h2>
                        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
                            {pasos.map((paso, indice) => (
                                <li key={paso.titulo} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                                    <span className="font-mono text-sm text-brand">{String(indice + 1).padStart(2, "0")}</span>
                                    <p className="mt-3 text-xl font-bold">{paso.titulo}</p>
                                    <p className="mt-1 text-sm text-white/65">{paso.texto}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </Contenedor>
            </FondoImagen>

            <Contenedor className="space-y-20 pt-16 sm:space-y-24 sm:pt-20">
                <section id="catalogo" className="scroll-mt-24">
                    <TituloSeccion>Catálogo</TituloSeccion>
                    <VistaCatalogo />
                </section>

                <section id="preguntas" className="scroll-mt-24">
                    <TituloSeccion>Preguntas frecuentes</TituloSeccion>
                    <div className="space-y-3">
                        {preguntas.map((item, indice) => (
                            <details key={item.pregunta} className="group rounded-2xl border border-slate-200 px-5 py-4 transition-colors open:bg-brand-50/60">
                                <summary className="flex cursor-pointer list-none items-center gap-4 font-semibold">
                                    <span className="font-mono text-xs text-slate-400">{String(indice + 1).padStart(2, "0")}</span>
                                    <span className="flex-1">{item.pregunta}</span>
                                    <span className="text-xl leading-none text-slate-400 transition-transform duration-150 group-open:rotate-45">+</span>
                                </summary>
                                <p className="mt-3 pl-9 text-sm text-slate-600">{item.respuesta}</p>
                            </details>
                        ))}
                    </div>
                </section>
            </Contenedor>
        </div>
    )
}
