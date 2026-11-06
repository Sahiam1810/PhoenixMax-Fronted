import { useMemo, useState } from "react"
import { precio } from "../../lib/formato"
import type { Compra, Resumen } from "../../types"

interface Props {
    compras: Compra[]
    resumen?: Resumen | null
}

type RangoTiempo = "7d" | "14d" | "30d" | "todo"

interface DiaVenta {
    fecha: string
    etiqueta: string
    total: number
    cantidad: number
}

interface PlataformaVenta {
    nombre: string
    color: string
    total: number
    cantidad: number
    porcentaje: number
}

const COLORES_PLATAFORMAS: Record<string, string> = {
    netflix: "#e50914",
    "disney+": "#113ccf",
    disney: "#113ccf",
    "prime video": "#00a8e1",
    primevideo: "#00a8e1",
    max: "#5822b4",
    "chatgpt plus": "#10a37f",
    chatgpt: "#10a37f",
    "canva pro": "#00c4cc",
    canva: "#00c4cc",
    "capcut pro": "#25c2c9",
    capcut: "#25c2c9",
    spotify: "#1db954",
    "youtube premium": "#ff0000"
}

const PALETA_FALLBACK = ["#ff7a1a", "#2563eb", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"]

function colorPara(nombre: string, indice: number): string {
    const clave = nombre.toLowerCase().trim()
    return COLORES_PLATAFORMAS[clave] ?? PALETA_FALLBACK[indice % PALETA_FALLBACK.length]
}

function claveFechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear()
    const mes = String(fecha.getMonth() + 1).padStart(2, "0")
    const dia = String(fecha.getDate()).padStart(2, "0")
    return `${anio}-${mes}-${dia}`
}

function formatearFechaCorta(fechaStr: string): string {
    try {
        const partes = fechaStr.split("-").map(Number)
        if (partes.length === 3 && !partes.some(Number.isNaN)) {
            const fecha = new Date(partes[0], partes[1] - 1, partes[2], 12, 0, 0)
            return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
        }
        const fecha = new Date(fechaStr)
        if (Number.isNaN(fecha.getTime())) return fechaStr
        return fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
    } catch {
        return fechaStr
    }
}

export function GraficasVentas({ compras, resumen: _resumen }: Props) {
    const [rango, setRango] = useState<RangoTiempo>("7d")
    const [diaSeleccionado, setDiaSeleccionado] = useState<DiaVenta | null>(null)
    const [plataformaSeleccionada, setPlataformaSeleccionada] = useState<PlataformaVenta | null>(null)

    const comprasPagadas = useMemo(() => {
        return compras.filter((c) => c.estado === "pagada")
    }, [compras])

    // 1. Agrupación por días según rango seleccionado
    const datosPorDia = useMemo(() => {
        const diasLimite = rango === "7d" ? 7 : rango === "14d" ? 14 : rango === "30d" ? 30 : 60
        const hoy = new Date()
        hoy.setHours(23, 59, 59, 999)

        const mapaDias = new Map<string, { total: number, cantidad: number }>()

        // Si es rango cerrado (7, 14, 30 días), inicializamos todos los días en 0 con fecha local
        if (rango !== "todo") {
            for (let i = diasLimite - 1; i >= 0; i--) {
                const f = new Date()
                f.setDate(f.getDate() - i)
                const clave = claveFechaLocal(f)
                mapaDias.set(clave, { total: 0, cantidad: 0 })
            }
        }

        // Rellenar con compras pagadas reales respetando la zona horaria local
        comprasPagadas.forEach((compra) => {
            const fechaObj = new Date(compra.pagadaAt || compra.createdAt)
            const fechaStr = claveFechaLocal(fechaObj)
            if (rango === "todo") {
                const actual = mapaDias.get(fechaStr) ?? { total: 0, cantidad: 0 }
                mapaDias.set(fechaStr, { total: actual.total + compra.total, cantidad: actual.cantidad + 1 })
            } else if (mapaDias.has(fechaStr)) {
                const actual = mapaDias.get(fechaStr)!
                mapaDias.set(fechaStr, { total: actual.total + compra.total, cantidad: actual.cantidad + 1 })
            }
        })

        const ordenados = Array.from(mapaDias.entries()).sort((a, b) => a[0].localeCompare(b[0]))

        return ordenados.map(([fecha, { total, cantidad }]): DiaVenta => ({
            fecha,
            etiqueta: formatearFechaCorta(fecha),
            total,
            cantidad
        }))
    }, [comprasPagadas, rango])

    // 2. Agrupación por plataforma
    const datosPlataformas = useMemo(() => {
        const mapa = new Map<string, { total: number, cantidad: number }>()
        let totalGeneral = 0

        comprasPagadas.forEach((compra) => {
            compra.items.forEach((item) => {
                const nombre = item.producto.plataforma.nombre || "Otra"
                const actual = mapa.get(nombre) ?? { total: 0, cantidad: 0 }
                mapa.set(nombre, {
                    total: actual.total + item.subtotal,
                    cantidad: actual.cantidad + item.cantidad
                })
                totalGeneral += item.subtotal
            })
        })

        const lista: PlataformaVenta[] = Array.from(mapa.entries()).map(([nombre, { total, cantidad }], idx) => ({
            nombre,
            color: colorPara(nombre, idx),
            total,
            cantidad,
            porcentaje: totalGeneral > 0 ? Math.round((total / totalGeneral) * 100) : 0
        }))

        return lista.sort((a, b) => b.total - a.total)
    }, [comprasPagadas])

    // 3. Agrupación por modalidad (Cuentas vs Pantallas)
    const datosModalidad = useMemo(() => {
        let cuentasTotal = 0
        let cuentasCant = 0
        let pantallasTotal = 0
        let pantallasCant = 0

        comprasPagadas.forEach((compra) => {
            compra.items.forEach((item) => {
                if (item.producto.tipo === "cuenta") {
                    cuentasTotal += item.subtotal
                    cuentasCant += item.cantidad
                } else {
                    pantallasTotal += item.subtotal
                    pantallasCant += item.cantidad
                }
            })
        })

        const granTotal = cuentasTotal + pantallasTotal
        const totalUnidades = cuentasCant + pantallasCant

        return {
            cuentas: {
                total: cuentasTotal,
                cantidad: cuentasCant,
                porcentaje: granTotal > 0 ? Math.round((cuentasTotal / granTotal) * 100) : 0
            },
            pantallas: {
                total: pantallasTotal,
                cantidad: pantallasCant,
                porcentaje: granTotal > 0 ? Math.round((pantallasTotal / granTotal) * 100) : 0
            },
            granTotal,
            totalUnidades
        }
    }, [comprasPagadas])

    // Estadísticas clave del periodo
    const totalPeriodo = useMemo(() => datosPorDia.reduce((acc, d) => acc + d.total, 0), [datosPorDia])
    const ordenesPeriodo = useMemo(() => datosPorDia.reduce((acc, d) => acc + d.cantidad, 0), [datosPorDia])
    const maxDia = useMemo(() => Math.max(...datosPorDia.map((d) => d.total), 1), [datosPorDia])

    // Dimensiones de la gráfica de barras
    const alturaGrafica = 180
    const anchoGrafica = 600

    return (
        <div className="space-y-6">
            {/* Encabezado con selector de rango */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div>
                    <h2 className="text-base font-bold text-ink dark:text-white sm:text-lg">
                        Rendimiento y Métricas de Ventas
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 sm:text-sm">
                        Análisis visual de transacciones, plataformas líderes y modalidades
                    </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-neutral-800 dark:bg-neutral-950">
                    {(
                        [
                            { id: "7d", label: "7 días" },
                            { id: "14d", label: "14 días" },
                            { id: "30d", label: "30 días" },
                            { id: "todo", label: "Historial" }
                        ] as const
                    ).map((r) => (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                                setRango(r.id)
                                setDiaSeleccionado(null)
                            }}
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                                rango === r.id
                                    ? "bg-brand text-ink shadow-sm"
                                    : "text-slate-600 hover:text-ink dark:text-neutral-400 dark:hover:text-white"
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Fila principal: Gráfica de ingresos en el tiempo + Donut por plataforma */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* 1. Gráfica de barras/tendencia diaria */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                                Evolución de Ingresos
                            </p>
                            <p className="text-2xl font-black text-ink dark:text-white">
                                {precio(totalPeriodo)}
                            </p>
                        </div>
                        <div className="text-right text-xs text-slate-500 dark:text-neutral-400">
                            <span className="font-semibold text-brand">{ordenesPeriodo}</span> compras registradas en este periodo
                        </div>
                    </div>

                    {/* Contenedor SVG Interactivo */}
                    <div className="relative mt-2">
                        {diaSeleccionado && (
                            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-ink px-3 py-1.5 text-xs text-white shadow-lg dark:bg-neutral-800">
                                <span className="font-bold">{diaSeleccionado.etiqueta}</span>: {precio(diaSeleccionado.total)} ({diaSeleccionado.cantidad} compras)
                            </div>
                        )}

                        <div className="overflow-x-auto pb-2">
                            <svg
                                viewBox={`0 0 ${anchoGrafica} ${alturaGrafica}`}
                                className="h-48 w-full min-w-[420px]"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#ff7a1a" stopOpacity="0.95" />
                                        <stop offset="100%" stopColor="#f0620a" stopOpacity="0.75" />
                                    </linearGradient>
                                    <linearGradient id="barHoverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#fb923c" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#ff7a1a" stopOpacity="0.9" />
                                    </linearGradient>
                                </defs>

                                {/* Líneas de fondo guía */}
                                {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                                    const y = alturaGrafica - 25 - pct * (alturaGrafica - 45)
                                    return (
                                        <g key={pct}>
                                            <line
                                                x1="0"
                                                y1={y}
                                                x2={anchoGrafica}
                                                y2={y}
                                                stroke="currentColor"
                                                className="text-slate-100 dark:text-neutral-800"
                                                strokeDasharray="3 3"
                                                strokeWidth="1"
                                            />
                                            {pct > 0 && (
                                                <text
                                                    x="4"
                                                    y={y - 3}
                                                    className="fill-slate-400 text-[9px] dark:fill-neutral-500 font-mono"
                                                >
                                                    ${Math.round((maxDia * pct) / 1000)}k
                                                </text>
                                            )}
                                        </g>
                                    )
                                })}

                                {/* Barras interactivas */}
                                {datosPorDia.map((d, i) => {
                                    const n = datosPorDia.length
                                    const espacioBarra = anchoGrafica / n
                                    const anchoBarra = Math.max(Math.min(espacioBarra * 0.65, 34), 6)
                                    const x = i * espacioBarra + (espacioBarra - anchoBarra) / 2
                                    const altoCalculado = maxDia > 0 ? (d.total / maxDia) * (alturaGrafica - 50) : 0
                                    const alto = Math.max(altoCalculado, d.total > 0 ? 5 : 2)
                                    const y = alturaGrafica - 25 - alto
                                    const esSeleccionado = diaSeleccionado?.fecha === d.fecha

                                    return (
                                        <g
                                            key={d.fecha}
                                            className="cursor-pointer transition-all duration-150"
                                            onMouseEnter={() => setDiaSeleccionado(d)}
                                            onMouseLeave={() => setDiaSeleccionado(null)}
                                        >
                                            <rect
                                                x={x}
                                                y={y}
                                                width={anchoBarra}
                                                height={alto}
                                                rx={Math.min(anchoBarra / 3, 4)}
                                                fill={
                                                    d.total === 0
                                                        ? "currentColor"
                                                        : esSeleccionado
                                                          ? "url(#barHoverGrad)"
                                                          : "url(#barGrad)"
                                                }
                                                className={
                                                    d.total === 0
                                                        ? "text-slate-100 dark:text-neutral-800"
                                                        : "transition-opacity hover:opacity-100"
                                                }
                                                opacity={esSeleccionado ? 1 : 0.88}
                                            />
                                            {/* Etiqueta del eje X (cada 1 o 2 días según densidad) */}
                                            {(n <= 10 || i % Math.ceil(n / 7) === 0 || i === n - 1) && (
                                                <text
                                                    x={x + anchoBarra / 2}
                                                    y={alturaGrafica - 8}
                                                    textAnchor="middle"
                                                    className="fill-slate-400 text-[10px] font-medium dark:fill-neutral-500"
                                                >
                                                    {d.etiqueta}
                                                </text>
                                            )}
                                        </g>
                                    )
                                })}
                            </svg>
                        </div>
                    </div>
                </div>

                {/* 2. Donut Chart: Distribución por plataforma */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                            Por Plataforma
                        </p>
                        <h3 className="text-lg font-bold text-ink dark:text-white">
                            Participación de Ventas
                        </h3>
                    </div>

                    {/* SVG Donut */}
                    <div className="relative my-4 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="size-36 -rotate-90">
                            {datosPlataformas.length === 0 ? (
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="38"
                                    stroke="currentColor"
                                    strokeWidth="16"
                                    fill="none"
                                    className="text-slate-100 dark:text-neutral-800"
                                />
                            ) : (
                                (() => {
                                    const radio = 38
                                    const circunferencia = 2 * Math.PI * radio
                                    let acumulado = 0

                                    return datosPlataformas.map((p) => {
                                        const largoSegmento = (p.porcentaje / 100) * circunferencia
                                        const dashArray = `${largoSegmento} ${circunferencia - largoSegmento}`
                                        const dashOffset = -acumulado
                                        acumulado += largoSegmento

                                        return (
                                            <circle
                                                key={p.nombre}
                                                cx="50"
                                                cy="50"
                                                r={radio}
                                                stroke={p.color}
                                                strokeWidth={plataformaSeleccionada?.nombre === p.nombre ? "18" : "15"}
                                                strokeDasharray={dashArray}
                                                strokeDashoffset={dashOffset}
                                                fill="none"
                                                className="cursor-pointer transition-all duration-200 hover:opacity-100"
                                                opacity={plataformaSeleccionada && plataformaSeleccionada.nombre !== p.nombre ? 0.45 : 0.9}
                                                onMouseEnter={() => setPlataformaSeleccionada(p)}
                                                onMouseLeave={() => setPlataformaSeleccionada(null)}
                                            />
                                        )
                                    })
                                })()
                            )}
                        </svg>

                        {/* Texto central del Donut */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                            {plataformaSeleccionada ? (
                                <>
                                    <span className="max-w-[70px] truncate text-[10px] font-bold text-slate-500 dark:text-neutral-400">
                                        {plataformaSeleccionada.nombre}
                                    </span>
                                    <span className="text-sm font-black text-ink dark:text-white">
                                        {plataformaSeleccionada.porcentaje}%
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-base font-black text-ink dark:text-white">
                                        {datosPlataformas.length}
                                    </span>
                                    <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-neutral-500">
                                        Plataformas
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Leyenda de plataformas */}
                    <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                        {datosPlataformas.length === 0 ? (
                            <p className="py-2 text-center text-xs text-slate-400">Sin datos de compras aún</p>
                        ) : (
                            datosPlataformas.map((p) => (
                                <div
                                    key={p.nombre}
                                    onMouseEnter={() => setPlataformaSeleccionada(p)}
                                    onMouseLeave={() => setPlataformaSeleccionada(null)}
                                    className={`flex items-center justify-between rounded-lg px-2 py-1 text-xs transition-colors cursor-pointer ${
                                        plataformaSeleccionada?.nombre === p.nombre
                                            ? "bg-slate-100 dark:bg-neutral-800"
                                            : "hover:bg-slate-50 dark:hover:bg-neutral-850"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <span
                                            className="size-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: p.color }}
                                        />
                                        <span className="truncate font-semibold text-slate-700 dark:text-neutral-200">
                                            {p.nombre}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-slate-500 dark:text-neutral-400 font-mono">
                                            {precio(p.total)}
                                        </span>
                                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-neutral-800 dark:text-neutral-300">
                                            {p.porcentaje}%
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Fila secundaria: Comparativa de Modalidad (Cuentas vs Pantallas) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Tarjeta Modalidad: Pantallas Individuales */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="inline-block rounded-md bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                                Modalidad Pantallas
                            </span>
                            <h4 className="mt-2 text-xl font-black text-ink dark:text-white">
                                {precio(datosModalidad.pantallas.total)}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-neutral-400">
                                {datosModalidad.pantallas.cantidad} pantallas individuales vendidas
                            </p>
                        </div>
                        <span className="text-2xl font-black text-brand">
                            {datosModalidad.pantallas.porcentaje}%
                        </span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                        <div
                            className="h-full rounded-full bg-brand transition-all duration-500"
                            style={{ width: `${datosModalidad.pantallas.porcentaje}%` }}
                        />
                    </div>
                </div>

                {/* Tarjeta Modalidad: Cuentas Completas */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="inline-block rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                Modalidad Cuentas Completas
                            </span>
                            <h4 className="mt-2 text-xl font-black text-ink dark:text-white">
                                {precio(datosModalidad.cuentas.total)}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-neutral-400">
                                {datosModalidad.cuentas.cantidad} cuentas completas vendidas
                            </p>
                        </div>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            {datosModalidad.cuentas.porcentaje}%
                        </span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                        <div
                            className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                            style={{ width: `${datosModalidad.cuentas.porcentaje}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
