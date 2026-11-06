import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ProgresoSecciones, type SeccionProgreso } from "../components/ProgresoSecciones"
import { Contenedor, FondoImagen, TituloSeccion } from "../components/ui"
import { VistaCatalogo } from "../components/VistaCatalogo"
import { useAuth } from "../context/AuthContext"

const secciones: SeccionProgreso[] = [
    { id: "inicio", titulo: "Inicio" },
    { id: "como-funciona", titulo: "Cómo funciona" },
    { id: "catalogo", titulo: "Catálogo" },
    { id: "preguntas", titulo: "Preguntas frecuentes" }
]

const logos = [
    { nombre: "Netflix",       color: "#E50914", letra: "N",  src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
    { nombre: "Disney+",       color: "#113CCF", letra: "D+", src: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg" },
    { nombre: "Max",           color: "#002BE7", letra: "M",  src: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg" },
    { nombre: "Prime Video",   color: "#00A8E1", letra: "P",  src: "https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg" },
    { nombre: "Spotify",       color: "#1DB954", letra: "S",  src: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" },
    { nombre: "ChatGPT",       color: "#10A37F", letra: "AI", src: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" },
    { nombre: "Canva",         color: "#00C4CC", letra: "C",  src: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Canva_Logo_2021.svg" },
    { nombre: "YouTube",       color: "#FF0000", letra: "YT", src: "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" },
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

export function CarruselLogos({ onColor }: { onColor?: (color: string) => void }) {
    const [actual, setActual] = useState(0)
    const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const total = logos.length

    const iniciar = () => {
        intervaloRef.current = setInterval(() => {
            setActual((prev) => (prev + 1) % total)
        }, 2200)
    }

    useEffect(() => {
        iniciar()
        return () => { if (intervaloRef.current) clearInterval(intervaloRef.current) }
    }, [])

    useEffect(() => {
        onColor?.(logos[actual].color)
    }, [actual, onColor])

    const ir = (indice: number) => {
        if (intervaloRef.current) clearInterval(intervaloRef.current)
        setActual(indice)
        iniciar()
    }

    const logo = logos[actual]

    return (
        <div className="flex flex-col items-center gap-5 select-none">
            <div
                className="relative flex h-56 w-72 items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm sm:h-64 sm:w-80"
                style={{ boxShadow: `0 0 60px ${logo.color}44` }}
            >
                <img
                    key={actual}
                    src={logo.src}
                    alt={logo.nombre}
                    className="max-h-24 max-w-[80%] object-contain drop-shadow-lg"
                />
                <div
                    className="absolute bottom-3 right-4 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow"
                    style={{ background: logo.color }}
                >
                    {logo.nombre}
                </div>
            </div>
            <div className="flex gap-2">
                {logos.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => ir(i)}
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                            width: i === actual ? "1.5rem" : "0.5rem",
                            background: i === actual ? logo.color : "rgba(255,255,255,0.3)"
                        }}
                        aria-label={logos[i].nombre}
                    />
                ))}
            </div>
        </div>
    )
}

export function Landing() {
    const { usuario } = useAuth()
    const [colorActual, setColorActual] = useState(logos[0].color)

    return (
        <div className="bg-ink text-white">
            <ProgresoSecciones secciones={secciones} />

            {/* CUADRO DE INICIO OSCURO - PANTALLA COMPLETA QUE TAPA TODO EL SCROLL */}
            <div className="-mt-[4.5rem] relative">
                <FondoImagen src="/img/hero.jpg" className="text-white min-h-[100dvh] flex flex-col justify-between">
                    {/* Capa de color dinámico que cubre todo el fondo */}
                    <div
                        className="pointer-events-none absolute inset-0 transition-all duration-1000"
                        style={{ background: `radial-gradient(ellipse 80% 60% at 70% 40%, ${colorActual}25 0%, transparent 70%)` }}
                    />

                    {/* SECCIÓN 1: INICIO (Ocupa el 100% de la altura de la pantalla) */}
                    <section id="inicio" className="relative flex flex-1 flex-col justify-center min-h-[100dvh] pt-28 pb-12 sm:pt-36 sm:pb-16">
                        <Contenedor className="w-full">
                            {/* Hero: texto a la izquierda, carrusel a la derecha */}
                            <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
                                {/* Columna izquierda: texto + botones */}
                                <div className="flex-1 text-center lg:text-left">
                                    <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
                                        Bienvenido al servicio de venta de cuentas más grande de Latinoamérica
                                    </h1>
                                    <p className="mt-5 text-white/75 sm:text-lg">
                                        Streaming, inteligencia artificial y edición en un solo lugar, con entrega inmediata.
                                    </p>
                                    <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                                        <a href="#catalogo" className="rounded-full bg-brand px-7 py-3 text-center text-sm font-bold text-ink transition-colors hover:bg-brand-600 shadow-lg shadow-brand/20">Ver catálogo</a>
                                        {!usuario && <Link to="/registro" className="rounded-full bg-white px-7 py-3 text-center text-sm font-bold text-ink transition-colors hover:bg-brand-50 shadow-lg shadow-white/10">Crear cuenta</Link>}
                                    </div>
                                </div>

                                {/* Columna derecha: carrusel */}
                                <div className="flex-shrink-0">
                                    <CarruselLogos onColor={setColorActual} />
                                </div>
                            </div>
                        </Contenedor>
                    </section>

                    {/* SECCIÓN 2: CÓMO FUNCIONA (Bloque oscuro intermedio antes de las secciones blancas) */}
                    <section id="como-funciona" className="relative scroll-mt-20 border-t border-white/10 bg-black/40 py-20 sm:py-28 backdrop-blur-xs">
                        <Contenedor>
                            <TituloSeccion>Cómo funciona</TituloSeccion>
                            <ol className="grid gap-4 sm:grid-cols-3">
                                {pasos.map((paso, indice) => (
                                    <li key={paso.titulo} className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10">
                                        <span className="font-mono text-sm text-brand">{String(indice + 1).padStart(2, "0")}</span>
                                        <p className="mt-3 text-xl font-bold">{paso.titulo}</p>
                                        <p className="mt-1 text-sm text-white/65">{paso.texto}</p>
                                    </li>
                                ))}
                            </ol>
                        </Contenedor>
                    </section>
                </FondoImagen>
            </div>

            {/* SECCIONES BLANCAS CON OVERLAY ELEGANTE Y MODERNO */}
            <div className="relative bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 dark:from-[#0c0d10] dark:via-[#111318] dark:to-[#0c0d10] text-ink dark:text-neutral-100 transition-colors overflow-hidden">
                {/* Overlay de cuadrícula de puntos sutil */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.25]"
                    style={{
                        backgroundImage: "radial-gradient(#94a3b8 1.2px, transparent 1.2px)",
                        backgroundSize: "28px 28px"
                    }}
                />
                {/* Halos ambientales tenues y limpios */}
                <div className="pointer-events-none absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-brand/5 blur-3xl" />
                <div className="pointer-events-none absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />
                <div className="pointer-events-none absolute bottom-12 right-10 h-[400px] w-[400px] rounded-full bg-brand/5 blur-3xl" />
                <div className="pointer-events-none absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/15 to-transparent" />

                <Contenedor className="relative z-10 space-y-20 py-20 sm:space-y-28 sm:py-28">
                    <section id="catalogo" className="scroll-mt-24">
                        <TituloSeccion>Catálogo</TituloSeccion>
                        <VistaCatalogo />
                    </section>

                    <section id="preguntas" className="scroll-mt-24">
                        <TituloSeccion>Preguntas frecuentes</TituloSeccion>
                        <div className="space-y-3">
                            {preguntas.map((item, indice) => (
                                <details key={item.pregunta} className="group rounded-2xl border border-slate-200/80 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/80 backdrop-blur-sm px-5 py-4 transition-all duration-200 shadow-xs hover:border-slate-300 dark:hover:border-neutral-700 open:bg-brand-50/70 open:border-brand-200 dark:open:bg-neutral-900 dark:open:border-neutral-700">
                                    <summary className="flex cursor-pointer list-none items-center gap-4 font-semibold text-ink dark:text-white">
                                        <span className="font-mono text-xs text-slate-400">{String(indice + 1).padStart(2, "0")}</span>
                                        <span className="flex-1">{item.pregunta}</span>
                                        <span className="text-xl leading-none text-slate-400 transition-transform duration-150 group-open:rotate-45">+</span>
                                    </summary>
                                    <p className="mt-3 pl-9 text-sm text-slate-600 dark:text-neutral-300">{item.respuesta}</p>
                                </details>
                            ))}
                        </div>
                    </section>
                </Contenedor>
            </div>
        </div>
    )
}
