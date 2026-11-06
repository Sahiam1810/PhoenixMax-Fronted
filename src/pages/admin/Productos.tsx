import { useState, type FormEvent } from "react"
import { EncabezadoAdmin, Panel, Tabla, Td, Th } from "../../components/admin"
import { Aviso, Boton, Campo, Cargando, Selector } from "../../components/ui"
import { useCarga } from "../../hooks/useCarga"
import { duracion, etiquetaTipo, precio } from "../../lib/formato"
import { adminService } from "../../services/adminService"
import { mensajeError } from "../../services/http"
import type { Plataforma, Producto, ProductoInput } from "../../types"

const cargarProductos = () => adminService.productos()
const cargarPlataformas = () => adminService.plataformas()

function FormProducto({ plataformas, onCreado }: { plataformas: Plataforma[], onCreado: (texto: string) => void }) {
    const [form, setForm] = useState<ProductoInput>({ plataformaId: plataformas[0]?.id ?? 0, tipo: "pantalla", duracionDias: 30, precio: 10000, activo: true })
    const [error, setError] = useState("")
    const [guardando, setGuardando] = useState(false)

    const enviar = async (evento: FormEvent) => {
        evento.preventDefault()
        if (form.duracionDias < 1 || form.precio <= 0) {
            setError("La duración y el precio deben ser mayores a 0")
            return
        }
        setGuardando(true)
        setError("")
        try {
            const respuesta = await adminService.crearProducto(form)
            onCreado(`${respuesta.message}: ${respuesta.data.plataforma.nombre} · ${etiquetaTipo[respuesta.data.tipo]}`)
        } catch (fallo) {
            setError(mensajeError(fallo))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={enviar} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Selector etiqueta="Plataforma" name="producto-plataforma" value={form.plataformaId} onChange={(evento) => setForm({ ...form, plataformaId: Number(evento.target.value) })}>
                {plataformas.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
            </Selector>
            <Selector etiqueta="Modalidad" name="producto-tipo" value={form.tipo} onChange={(evento) => setForm({ ...form, tipo: evento.target.value === "cuenta" ? "cuenta" : "pantalla" })}>
                <option value="pantalla">Pantalla</option>
                <option value="cuenta">Cuenta completa</option>
            </Selector>
            <Campo etiqueta="Duración (días)" name="producto-duracion" type="number" min={1} step={1} value={form.duracionDias} onChange={(evento) => setForm({ ...form, duracionDias: Number(evento.target.value) })} />
            <Campo etiqueta="Precio (COP)" name="producto-precio" type="number" min={0} step={500} value={form.precio} onChange={(evento) => setForm({ ...form, precio: Number(evento.target.value) })} />
            <div className="flex items-end">
                <Boton type="submit" className="w-full" cargando={guardando}>Crear producto</Boton>
            </div>
            {error && <div className="sm:col-span-2 lg:col-span-5"><Aviso tipo="error">{error}</Aviso></div>}
        </form>
    )
}

function FilaProducto({ producto, onCambio }: { producto: Producto, onCambio: (texto: string, tipo: "exito" | "error") => void }) {
    const [valor, setValor] = useState(String(producto.precio))
    const [ocupado, setOcupado] = useState(false)

    const actualizar = async (input: Partial<ProductoInput>) => {
        setOcupado(true)
        try {
            const respuesta = await adminService.actualizarProducto(producto.id, input)
            onCambio(`${respuesta.message}: ${producto.plataforma.nombre} · ${etiquetaTipo[producto.tipo]}`, "exito")
        } catch (fallo) {
            onCambio(mensajeError(fallo), "error")
        } finally {
            setOcupado(false)
        }
    }

    const nuevoPrecio = Number(valor)
    const cambioPrecio = nuevoPrecio > 0 && nuevoPrecio !== producto.precio

    return (
        <tr className={producto.activo ? "" : "text-slate-400"}>
            <Td className="font-medium">{producto.plataforma.nombre}</Td>
            <Td>{etiquetaTipo[producto.tipo]}</Td>
            <Td>{duracion(producto.duracionDias)}</Td>
            <Td>
                <div className="flex items-center gap-2">
                    <input aria-label="Precio" type="number" min={0} step={500} value={valor} onChange={(evento) => setValor(evento.target.value)} className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" />
                    {cambioPrecio && <button type="button" disabled={ocupado} onClick={() => actualizar({ precio: nuevoPrecio })} className="text-xs font-semibold text-ink dark:text-brand underline">Guardar</button>}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{precio(producto.precio)}</p>
            </Td>
            <Td className={producto.stock === 0 ? "font-semibold text-red-600" : ""}>{producto.stock === 0 ? "Agotado" : producto.stock}</Td>
            <Td className="text-right">
                <button type="button" disabled={ocupado} onClick={() => actualizar({ activo: !producto.activo })} className={`text-xs font-semibold disabled:opacity-50 ${producto.activo ? "text-red-600" : "text-emerald-700"}`}>
                    {producto.activo ? "Ocultar" : "Publicar"}
                </button>
            </Td>
        </tr>
    )
}

export function Productos() {
    const productos = useCarga(cargarProductos)
    const plataformas = useCarga(cargarPlataformas)
    const [formAbierto, setFormAbierto] = useState(false)
    const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error", texto: string } | null>(null)

    const notificar = (texto: string, tipo: "exito" | "error") => {
        setMensaje({ tipo, texto })
        if (tipo === "exito") productos.recargar()
    }

    return (
        <div>
            <EncabezadoAdmin
                titulo="Productos"
                descripcion="Precios, duración y visibilidad en el catálogo"
                acciones={<Boton onClick={() => setFormAbierto((valor) => !valor)}>{formAbierto ? "Cancelar" : "Nuevo producto"}</Boton>}
            />
            {formAbierto && plataformas.data && (
                <Panel titulo="Nuevo producto" onCerrar={() => setFormAbierto(false)}>
                    <FormProducto plataformas={plataformas.data} onCreado={(texto) => {
                        setFormAbierto(false)
                        notificar(texto, "exito")
                    }} />
                </Panel>
            )}
            {mensaje && <div className="mb-4"><Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso></div>}
            {productos.cargando && !productos.data && <Cargando />}
            {productos.error && <Aviso tipo="error">{productos.error}</Aviso>}
            {productos.data && (
                <Tabla>
                    <thead>
                        <tr>
                            <Th>Plataforma</Th>
                            <Th>Modalidad</Th>
                            <Th>Duración</Th>
                            <Th>Precio</Th>
                            <Th>Stock</Th>
                            <Th className="text-right">Catálogo</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.data.map((producto) => <FilaProducto key={`${producto.id}-${producto.precio}-${producto.activo}`} producto={producto} onCambio={notificar} />)}
                    </tbody>
                </Tabla>
            )}
        </div>
    )
}
