import { useState, type FormEvent } from "react"
import { ConFiltros, EncabezadoAdmin, GrupoFiltro, Panel, Tabla, Td, Th } from "../../components/admin"
import { Aviso, Boton, Campo, Cargando, Insignia, Selector } from "../../components/ui"
import { useAuth } from "../../context/AuthContext"
import { useCarga } from "../../hooks/useCarga"
import { formatoFecha } from "../../lib/formato"
import { esEmail, sinErrores, type Errores } from "../../lib/validacion"
import { adminService } from "../../services/adminService"
import { mensajeError } from "../../services/http"
import type { Rol, Usuario, UsuarioInput } from "../../types"

const cargarUsuarios = () => adminService.usuarios()

const vacio: UsuarioInput = { nombre: "", email: "", telefono: "", password: "", rol: "cliente" }

function FormUsuario({ onCreado }: { onCreado: (texto: string) => void }) {
    const [form, setForm] = useState<UsuarioInput>(vacio)
    const [errores, setErrores] = useState<Errores<UsuarioInput>>({})
    const [error, setError] = useState("")
    const [guardando, setGuardando] = useState(false)

    const enviar = async (evento: FormEvent) => {
        evento.preventDefault()
        const nuevos: Errores<UsuarioInput> = {
            nombre: form.nombre.trim().length < 3 ? "Mínimo 3 caracteres" : undefined,
            email: !esEmail(form.email) ? "Correo no válido" : undefined,
            password: form.password.length < 8 ? "Mínimo 8 caracteres" : undefined
        }
        setErrores(nuevos)
        if (!sinErrores(nuevos)) return
        setGuardando(true)
        setError("")
        try {
            const respuesta = await adminService.crearUsuario(form)
            setForm(vacio)
            onCreado(`${respuesta.message}: ${respuesta.data.email}`)
        } catch (fallo) {
            setError(mensajeError(fallo))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={enviar} noValidate className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Campo etiqueta="Nombre" name="nuevo-nombre" value={form.nombre} error={errores.nombre} onChange={(evento) => setForm({ ...form, nombre: evento.target.value })} />
            <Campo etiqueta="Correo" name="nuevo-email" type="email" value={form.email} error={errores.email} onChange={(evento) => setForm({ ...form, email: evento.target.value })} />
            <Campo etiqueta="Teléfono" name="nuevo-telefono" type="tel" value={form.telefono} onChange={(evento) => setForm({ ...form, telefono: evento.target.value })} />
            <Campo etiqueta="Contraseña temporal" name="nuevo-password" value={form.password} error={errores.password} onChange={(evento) => setForm({ ...form, password: evento.target.value })} />
            <Selector etiqueta="Rol" name="nuevo-rol" value={form.rol} onChange={(evento) => setForm({ ...form, rol: evento.target.value === "admin" ? "admin" : "cliente" })}>
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
            </Selector>
            <div className="flex items-end">
                <Boton type="submit" className="w-full" cargando={guardando}>Crear usuario</Boton>
            </div>
            {error && <div className="sm:col-span-2 lg:col-span-3"><Aviso tipo="error">{error}</Aviso></div>}
        </form>
    )
}

export function Usuarios() {
    const { usuario: actual } = useAuth()
    const usuarios = useCarga(cargarUsuarios)
    const [rol, setRol] = useState<Rol | "todos">("todos")
    const [estado, setEstado] = useState<"todos" | "activos" | "inactivos">("todos")
    const [busqueda, setBusqueda] = useState("")
    const [formAbierto, setFormAbierto] = useState(false)
    const [ocupado, setOcupado] = useState<number | null>(null)
    const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error", texto: string } | null>(null)

    const todos = usuarios.data ?? []
    const texto = busqueda.trim().toLowerCase()
    const visibles = todos
        .filter((item) => rol === "todos" || item.rol === rol)
        .filter((item) => estado === "todos" || item.activo === (estado === "activos"))
        .filter((item) => !texto || item.nombre.toLowerCase().includes(texto) || item.email.toLowerCase().includes(texto))

    const alternar = async (usuario: Usuario) => {
        setOcupado(usuario.id)
        setMensaje(null)
        try {
            const respuesta = await adminService.cambiarEstadoUsuario(usuario.id, !usuario.activo)
            setMensaje({ tipo: "exito", texto: `${respuesta.message}: ${usuario.email}` })
            await usuarios.recargar()
        } catch (fallo) {
            setMensaje({ tipo: "error", texto: mensajeError(fallo) })
        } finally {
            setOcupado(null)
        }
    }

    const filtros = (
        <>
            <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">Buscar</span>
                <input value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Nombre o correo" className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" />
            </label>
            <GrupoFiltro
                titulo="Rol"
                valor={rol}
                onCambio={setRol}
                opciones={[
                    { valor: "todos", texto: "Todos", cantidad: todos.length },
                    { valor: "cliente", texto: "Clientes", cantidad: todos.filter((item) => item.rol === "cliente").length },
                    { valor: "admin", texto: "Administradores", cantidad: todos.filter((item) => item.rol === "admin").length }
                ]}
            />
            <GrupoFiltro
                titulo="Estado"
                valor={estado}
                onCambio={setEstado}
                opciones={[
                    { valor: "todos", texto: "Todos" },
                    { valor: "activos", texto: "Activos", cantidad: todos.filter((item) => item.activo).length },
                    { valor: "inactivos", texto: "Inactivos", cantidad: todos.filter((item) => !item.activo).length }
                ]}
            />
        </>
    )

    return (
        <div>
            <EncabezadoAdmin
                titulo="Gestión de usuarios"
                descripcion="Activa, desactiva o crea usuarios de forma manual"
                acciones={<Boton onClick={() => setFormAbierto((valor) => !valor)}>{formAbierto ? "Cancelar" : "Crear usuario"}</Boton>}
            />
            {formAbierto && (
                <Panel titulo="Nuevo usuario" onCerrar={() => setFormAbierto(false)}>
                    <FormUsuario
                        onCreado={(textoMensaje) => {
                            setMensaje({ tipo: "exito", texto: textoMensaje })
                            setFormAbierto(false)
                            usuarios.recargar()
                        }}
                    />
                </Panel>
            )}
            {mensaje && <div className="mb-4"><Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso></div>}
            <ConFiltros filtros={filtros}>
                {usuarios.cargando && !usuarios.data && <Cargando />}
                {usuarios.error && <Aviso tipo="error">{usuarios.error}</Aviso>}
                {usuarios.data && (
                    <Tabla>
                        <thead>
                            <tr>
                                <Th>Usuario</Th>
                                <Th>Rol</Th>
                                <Th>Teléfono</Th>
                                <Th>Alta</Th>
                                <Th>Estado</Th>
                                <Th className="text-right">Acción</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibles.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">Sin usuarios para estos filtros</td></tr>}
                            {visibles.map((usuario) => (
                                <tr key={usuario.id}>
                                    <Td>
                                        <p className="font-medium">{usuario.nombre}</p>
                                        <p className="text-xs text-slate-500">{usuario.email}</p>
                                    </Td>
                                    <Td>{usuario.rol === "admin" ? "Administrador" : "Cliente"}</Td>
                                    <Td className="text-slate-600">{usuario.telefono || "—"}</Td>
                                    <Td className="text-xs text-slate-500">{formatoFecha(usuario.createdAt)}</Td>
                                    <Td>
                                        <Insignia className={usuario.activo ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}>{usuario.activo ? "Activo" : "Inactivo"}</Insignia>
                                    </Td>
                                    <Td className="text-right">
                                        {usuario.id !== actual?.id && (
                                            <button type="button" disabled={ocupado === usuario.id} onClick={() => alternar(usuario)} className={`text-xs font-semibold disabled:opacity-50 ${usuario.activo ? "text-red-600" : "text-emerald-700"}`}>
                                                {usuario.activo ? "Desactivar" : "Activar"}
                                            </button>
                                        )}
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </Tabla>
                )}
            </ConFiltros>
        </div>
    )
}
