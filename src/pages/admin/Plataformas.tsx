import { useState, type FormEvent } from "react"
import { EncabezadoAdmin, Panel, Tabla, Td, Th } from "../../components/admin"
import { Aviso, Boton, Campo, Cargando, Selector } from "../../components/ui"
import { useCarga } from "../../hooks/useCarga"
import { etiquetaCategoria } from "../../lib/formato"
import { adminService } from "../../services/adminService"
import { mensajeError } from "../../services/http"
import type { Categoria, Plataforma, PlataformaInput } from "../../types"

const cargarPlataformas = () => adminService.plataformas()
const categorias: Categoria[] = ["streaming", "ia", "edicion"]

function esCategoria(valor: string): valor is Categoria {
    return valor === "streaming" || valor === "ia" || valor === "edicion"
}

const vacia: PlataformaInput = { nombre: "", descripcion: "", color: "#38b6ff", categoria: "streaming", maxPantallas: 4, activo: true }

function FormPlataforma({ onCreada }: { onCreada: (texto: string) => void }) {
    const [form, setForm] = useState<PlataformaInput>(vacia)
    const [error, setError] = useState("")
    const [guardando, setGuardando] = useState(false)

    const enviar = async (evento: FormEvent) => {
        evento.preventDefault()
        if (form.nombre.trim().length < 2 || form.maxPantallas < 1) {
            setError("Escribe un nombre y al menos 1 pantalla por cuenta")
            return
        }
        setGuardando(true)
        setError("")
        try {
            const respuesta = await adminService.crearPlataforma(form)
            onCreada(`${respuesta.message}: ${respuesta.data.nombre}`)
        } catch (fallo) {
            setError(mensajeError(fallo))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={enviar} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Campo etiqueta="Nombre" name="plataforma-nombre" value={form.nombre} onChange={(evento) => setForm({ ...form, nombre: evento.target.value })} />
            <Selector etiqueta="Categoría" name="plataforma-categoria" value={form.categoria} onChange={(evento) => setForm({ ...form, categoria: esCategoria(evento.target.value) ? evento.target.value : "streaming" })}>
                {categorias.map((item) => <option key={item} value={item}>{etiquetaCategoria[item]}</option>)}
            </Selector>
            <Campo etiqueta="Pantallas por cuenta" name="plataforma-max" type="number" min={1} max={10} value={form.maxPantallas} onChange={(evento) => setForm({ ...form, maxPantallas: Number(evento.target.value) })} />
            <Campo etiqueta="Color" name="plataforma-color" type="color" value={form.color} onChange={(evento) => setForm({ ...form, color: evento.target.value })} className="[&_input]:h-10.5 [&_input]:p-1" />
            <Campo etiqueta="Descripción" name="plataforma-descripcion" value={form.descripcion} onChange={(evento) => setForm({ ...form, descripcion: evento.target.value })} className="sm:col-span-2 lg:col-span-3" />
            <div className="flex items-end">
                <Boton type="submit" className="w-full" cargando={guardando}>Crear plataforma</Boton>
            </div>
            {error && <div className="sm:col-span-2 lg:col-span-4"><Aviso tipo="error">{error}</Aviso></div>}
        </form>
    )
}

function FilaPlataforma({ plataforma, onCambio }: { plataforma: Plataforma, onCambio: (texto: string, tipo: "exito" | "error") => void }) {
    const [maximo, setMaximo] = useState(String(plataforma.maxPantallas))
    const [ocupado, setOcupado] = useState(false)

    const actualizar = async (input: Partial<PlataformaInput>) => {
        setOcupado(true)
        try {
            const respuesta = await adminService.actualizarPlataforma(plataforma.id, input)
            onCambio(`${respuesta.message}: ${plataforma.nombre}`, "exito")
        } catch (fallo) {
            onCambio(mensajeError(fallo), "error")
        } finally {
            setOcupado(false)
        }
    }

    const nuevoMaximo = Number(maximo)
    const cambio = nuevoMaximo >= 1 && nuevoMaximo !== plataforma.maxPantallas

    return (
        <tr className={plataforma.activo ? "" : "text-slate-400"}>
            <Td>
                <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: plataforma.color }} />
                    <span className="font-medium">{plataforma.nombre}</span>
                </div>
                <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{plataforma.descripcion}</p>
            </Td>
            <Td>{etiquetaCategoria[plataforma.categoria]}</Td>
            <Td>
                <div className="flex items-center gap-2">
                    <input aria-label="Pantallas por cuenta" type="number" min={1} max={10} value={maximo} onChange={(evento) => setMaximo(evento.target.value)} className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm" />
                    {cambio && <button type="button" disabled={ocupado} onClick={() => actualizar({ maxPantallas: nuevoMaximo })} className="text-xs font-semibold underline">Guardar</button>}
                </div>
            </Td>
            <Td className="text-right">
                <button type="button" disabled={ocupado} onClick={() => actualizar({ activo: !plataforma.activo })} className={`text-xs font-semibold disabled:opacity-50 ${plataforma.activo ? "text-red-600" : "text-emerald-700"}`}>
                    {plataforma.activo ? "Desactivar" : "Activar"}
                </button>
            </Td>
        </tr>
    )
}

export function Plataformas() {
    const plataformas = useCarga(cargarPlataformas)
    const [formAbierto, setFormAbierto] = useState(false)
    const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error", texto: string } | null>(null)

    const notificar = (texto: string, tipo: "exito" | "error") => {
        setMensaje({ tipo, texto })
        if (tipo === "exito") plataformas.recargar()
    }

    return (
        <div>
            <EncabezadoAdmin
                titulo="Plataformas"
                descripcion="El cambio de pantallas por cuenta aplica a las cuentas que se carguen después"
                acciones={<Boton onClick={() => setFormAbierto((valor) => !valor)}>{formAbierto ? "Cancelar" : "Nueva plataforma"}</Boton>}
            />
            {formAbierto && (
                <Panel titulo="Nueva plataforma" onCerrar={() => setFormAbierto(false)}>
                    <FormPlataforma onCreada={(texto) => {
                        setFormAbierto(false)
                        notificar(texto, "exito")
                    }} />
                </Panel>
            )}
            {mensaje && <div className="mb-4"><Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso></div>}
            {plataformas.cargando && !plataformas.data && <Cargando />}
            {plataformas.error && <Aviso tipo="error">{plataformas.error}</Aviso>}
            {plataformas.data && (
                <Tabla>
                    <thead>
                        <tr>
                            <Th>Plataforma</Th>
                            <Th>Categoría</Th>
                            <Th>Pantallas por cuenta</Th>
                            <Th className="text-right">Estado</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {plataformas.data.map((plataforma) => <FilaPlataforma key={`${plataforma.id}-${plataforma.maxPantallas}-${plataforma.activo}`} plataforma={plataforma} onCambio={notificar} />)}
                    </tbody>
                </Tabla>
            )}
        </div>
    )
}
