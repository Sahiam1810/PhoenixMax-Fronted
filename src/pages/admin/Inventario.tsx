import { Fragment, useState, type FormEvent } from "react"
import { ConFiltros, EncabezadoAdmin, GrupoFiltro, Indicador, Panel, Tabla, Td, Th } from "../../components/admin"
import { Aviso, Boton, Campo, Cargando, Insignia, Selector } from "../../components/ui"
import { useCarga } from "../../hooks/useCarga"
import { etiquetaEstadoCuenta, formatoFecha } from "../../lib/formato"
import { esEmail } from "../../lib/validacion"
import { adminService } from "../../services/adminService"
import { mensajeError } from "../../services/http"
import type { Cuenta, EstadoCuenta } from "../../types"

const cargarCuentas = () => adminService.cuentas()
const cargarPlataformas = () => adminService.plataformas()

const coloresEstado: Record<EstadoCuenta, string> = {
    disponible: "bg-emerald-100 text-emerald-800",
    parcial: "bg-brand-100 text-brand-700",
    vendida: "bg-slate-200 text-slate-700",
    inactiva: "bg-red-100 text-red-700"
}

const estados: EstadoCuenta[] = ["disponible", "parcial", "vendida", "inactiva"]

function vendidas(cuenta: Cuenta) {
    return cuenta.pantallas.filter((item) => item.estado === "vendida").length
}

function stockDe(cuentas: Cuenta[]) {
    const activas = cuentas.filter((item) => item.estado !== "inactiva")
    return {
        cuentas: activas.filter((item) => item.estado === "disponible" && vendidas(item) === 0).length,
        pantallas: activas
            .filter((item) => item.estado !== "vendida")
            .reduce((total, item) => total + item.pantallas.filter((pantalla) => pantalla.estado === "disponible").length, 0)
    }
}

function FormCuenta({ plataformas, onCreada }: { plataformas: Array<{ id: number, nombre: string, maxPantallas: number }>, onCreada: (texto: string) => void }) {
    const [plataformaId, setPlataformaId] = useState(plataformas[0]?.id ?? 0)
    const [emailAcceso, setEmailAcceso] = useState("")
    const [passwordAcceso, setPasswordAcceso] = useState("")
    const [error, setError] = useState("")
    const [guardando, setGuardando] = useState(false)
    const seleccionada = plataformas.find((item) => item.id === plataformaId)

    const enviar = async (evento: FormEvent) => {
        evento.preventDefault()
        if (!esEmail(emailAcceso)) {
            setError("Escribe un correo de acceso válido")
            return
        }
        if (passwordAcceso.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres")
            return
        }
        setGuardando(true)
        setError("")
        try {
            const respuesta = await adminService.crearCuenta({ plataformaId, emailAcceso, passwordAcceso })
            setEmailAcceso("")
            setPasswordAcceso("")
            onCreada(`${respuesta.message}: ${respuesta.data.emailAcceso} (${respuesta.data.pantallas.length} pantallas)`)
        } catch (fallo) {
            setError(mensajeError(fallo))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={enviar} className="grid gap-3 sm:grid-cols-3">
            <Selector etiqueta="Plataforma" name="plataformaId" value={plataformaId} onChange={(evento) => setPlataformaId(Number(evento.target.value))}>
                {plataformas.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
            </Selector>
            <Campo etiqueta="Correo de acceso" name="emailAcceso" type="email" value={emailAcceso} onChange={(evento) => setEmailAcceso(evento.target.value)} />
            <Campo etiqueta="Contraseña de acceso" name="passwordAcceso" value={passwordAcceso} onChange={(evento) => setPasswordAcceso(evento.target.value)} />
            <p className="text-xs text-slate-500 sm:col-span-2">Se generarán {seleccionada?.maxPantallas ?? 0} pantallas con perfil y PIN automáticamente. Usa solo datos ficticios.</p>
            <Boton type="submit" cargando={guardando}>Guardar cuenta</Boton>
            {error && <div className="sm:col-span-3"><Aviso tipo="error">{error}</Aviso></div>}
        </form>
    )
}

export function Inventario() {
    const cuentas = useCarga(cargarCuentas)
    const plataformas = useCarga(cargarPlataformas)
    const [plataforma, setPlataforma] = useState("todas")
    const [estado, setEstado] = useState<EstadoCuenta | "todos">("todos")
    const [formAbierto, setFormAbierto] = useState(false)
    const [expandida, setExpandida] = useState<number | null>(null)
    const [ocupada, setOcupada] = useState<number | null>(null)
    const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error", texto: string } | null>(null)

    const todas = cuentas.data ?? []
    const porPlataforma = todas.filter((item) => plataforma === "todas" || String(item.plataforma.id) === plataforma)
    const visibles = porPlataforma.filter((item) => estado === "todos" || item.estado === estado)
    const stock = stockDe(porPlataforma)

    const cambiarEstado = async (cuenta: Cuenta) => {
        setOcupada(cuenta.id)
        setMensaje(null)
        try {
            const respuesta = await adminService.cambiarEstadoCuenta(cuenta.id, cuenta.estado === "inactiva")
            setMensaje({ tipo: "exito", texto: `${respuesta.message}: ${cuenta.emailAcceso}` })
            await cuentas.recargar()
        } catch (fallo) {
            setMensaje({ tipo: "error", texto: mensajeError(fallo) })
        } finally {
            setOcupada(null)
        }
    }

    const filtros = (
        <>
            <GrupoFiltro
                titulo="Plataforma"
                valor={plataforma}
                onCambio={setPlataforma}
                opciones={[
                    { valor: "todas", texto: "Todas", cantidad: todas.length },
                    ...(plataformas.data ?? []).map((item) => ({ valor: String(item.id), texto: item.nombre, cantidad: todas.filter((cuenta) => cuenta.plataforma.id === item.id).length }))
                ]}
            />
            <GrupoFiltro
                titulo="Estado"
                valor={estado}
                onCambio={setEstado}
                opciones={[
                    { valor: "todos", texto: "Todos", cantidad: porPlataforma.length },
                    ...estados.map((item) => ({ valor: item, texto: etiquetaEstadoCuenta[item], cantidad: porPlataforma.filter((cuenta) => cuenta.estado === item).length }))
                ]}
            />
        </>
    )

    return (
        <div>
            <EncabezadoAdmin
                titulo="Inventario"
                descripcion="Cuentas cargadas y sus pantallas. Agrega cuentas para subir el stock o desactívalas para retirarlo."
                acciones={<Boton onClick={() => setFormAbierto((valor) => !valor)}>{formAbierto ? "Cancelar" : "Agregar cuenta"}</Boton>}
            />
            {formAbierto && plataformas.data && (
                <Panel titulo="Cargar cuenta" onCerrar={() => setFormAbierto(false)}>
                    <FormCuenta
                        plataformas={plataformas.data}
                        onCreada={(texto) => {
                            setMensaje({ tipo: "exito", texto })
                            cuentas.recargar()
                        }}
                    />
                </Panel>
            )}
            {mensaje && <div className="mb-4"><Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso></div>}
            <ConFiltros filtros={filtros}>
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Indicador etiqueta="Stock cuenta completa" valor={String(stock.cuentas)} />
                    <Indicador etiqueta="Stock pantallas" valor={String(stock.pantallas)} />
                    <Indicador etiqueta="Cuentas" valor={String(porPlataforma.length)} detalle={`${porPlataforma.filter((item) => item.estado === "inactiva").length} inactivas`} />
                </div>
                {cuentas.cargando && !cuentas.data && <Cargando />}
                {cuentas.error && <Aviso tipo="error">{cuentas.error}</Aviso>}
                {cuentas.data && (
                    <Tabla>
                        <thead>
                            <tr>
                                <Th>Plataforma</Th>
                                <Th>Correo de acceso</Th>
                                <Th>Estado</Th>
                                <Th>Pantallas vendidas</Th>
                                <Th>Alta</Th>
                                <Th className="text-right">Acciones</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibles.length === 0 && (
                                <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">Sin cuentas para estos filtros</td></tr>
                            )}
                            {visibles.map((cuenta) => (
                                <Fragment key={cuenta.id}>
                                    <tr>
                                        <Td className="font-medium">{cuenta.plataforma.nombre}</Td>
                                        <Td className="font-mono text-xs">{cuenta.emailAcceso}</Td>
                                        <Td><Insignia className={coloresEstado[cuenta.estado]}>{etiquetaEstadoCuenta[cuenta.estado]}</Insignia></Td>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-0.5">
                                                    {cuenta.pantallas.map((pantalla) => (
                                                        <span key={pantalla.id} title={`${pantalla.nombrePerfil}: ${pantalla.estado}`} className={`h-3 w-2 rounded-sm ${pantalla.estado === "vendida" ? "bg-ink dark:bg-brand" : "bg-slate-300 dark:bg-neutral-700"}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-neutral-400">{vendidas(cuenta)}/{cuenta.pantallas.length}</span>
                                            </div>
                                        </Td>
                                        <Td className="text-xs text-slate-500 dark:text-neutral-400">{cuenta.createdAt ? formatoFecha(cuenta.createdAt) : "—"}</Td>
                                        <Td className="whitespace-nowrap text-right">
                                            <button type="button" onClick={() => setExpandida(expandida === cuenta.id ? null : cuenta.id)} className="mr-3 text-xs font-semibold text-slate-600 hover:text-ink dark:text-neutral-400 dark:hover:text-white">
                                                {expandida === cuenta.id ? "Ocultar" : "Pantallas"}
                                            </button>
                                            {cuenta.estado !== "vendida" && (
                                                <button type="button" disabled={ocupada === cuenta.id} onClick={() => cambiarEstado(cuenta)} className={`text-xs font-semibold disabled:opacity-50 ${cuenta.estado === "inactiva" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                                    {cuenta.estado === "inactiva" ? "Activar" : "Desactivar"}
                                                </button>
                                            )}
                                        </Td>
                                    </tr>
                                    {expandida === cuenta.id && (
                                        <tr>
                                            <td colSpan={6} className="border-b border-slate-100 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900/60 px-3 py-3">
                                                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                                    {cuenta.pantallas.map((pantalla) => (
                                                        <div key={pantalla.id} className="rounded-md border border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-800 px-3 py-2 text-xs">
                                                            <p className="font-semibold text-ink dark:text-white">{pantalla.nombrePerfil}</p>
                                                            {pantalla.pin && <p className="text-slate-500 dark:text-neutral-400">PIN {pantalla.pin}</p>}
                                                            <p className={pantalla.estado === "vendida" ? "font-semibold text-ink dark:text-neutral-300" : "text-emerald-700 dark:text-emerald-400"}>{pantalla.estado === "vendida" ? "Vendida" : "Disponible"}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </Tabla>
                )}
            </ConFiltros>
        </div>
    )
}
