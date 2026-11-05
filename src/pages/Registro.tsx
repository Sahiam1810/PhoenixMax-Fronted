import { useState, type FormEvent } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { AuthLayout } from "../components/AuthLayout"
import { Aviso, Boton, Campo } from "../components/ui"
import { useAuth } from "../context/AuthContext"
import { esEmail, sinErrores, type Errores } from "../lib/validacion"
import { authService } from "../services/authService"
import { mensajeError } from "../services/http"
import type { RegisterInput } from "../types"

interface FormRegistro extends RegisterInput {
    confirmacion: string
}

function rutaDestino(estado: unknown) {
    if (estado && typeof estado === "object" && "desde" in estado && typeof estado.desde === "string") return estado.desde
    return "/"
}

export function Registro() {
    const { usuario, iniciarSesion } = useAuth()
    const location = useLocation()
    const [form, setForm] = useState<FormRegistro>({ nombre: "", email: "", telefono: "", password: "", confirmacion: "" })
    const [errores, setErrores] = useState<Errores<FormRegistro>>({})
    const [error, setError] = useState("")
    const [enviando, setEnviando] = useState(false)

    if (usuario) return <Navigate to={usuario.rol === "admin" ? "/admin" : rutaDestino(location.state)} replace />

    const cambiar = (campo: keyof FormRegistro, valor: string) => setForm({ ...form, [campo]: valor })

    const enviar = async (evento: FormEvent) => {
        evento.preventDefault()
        const nuevos: Errores<FormRegistro> = {
            nombre: form.nombre.trim().length < 3 ? "Escribe tu nombre completo" : undefined,
            email: !esEmail(form.email) ? "Escribe un correo válido" : undefined,
            telefono: form.telefono && !/^\+?\d{7,15}$/.test(form.telefono.replace(/\s/g, "")) ? "Escribe solo números (7 a 15 dígitos)" : undefined,
            password: form.password.length < 8 ? "Mínimo 8 caracteres" : !/\d/.test(form.password) || !/[a-zA-Z]/.test(form.password) ? "Usa letras y números" : undefined,
            confirmacion: form.confirmacion !== form.password ? "Las contraseñas no coinciden" : undefined
        }
        setErrores(nuevos)
        if (!sinErrores(nuevos)) return
        setEnviando(true)
        setError("")
        try {
            const { data } = await authService.register({ nombre: form.nombre, email: form.email, telefono: form.telefono.replace(/\s/g, ""), password: form.password })
            iniciarSesion(data.usuario, data.token)
        } catch (fallo) {
            setError(mensajeError(fallo))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <AuthLayout titulo="Crear cuenta" subtitulo="Regístrate en menos de un minuto">
            <form onSubmit={enviar} noValidate className="space-y-4">
                <Campo etiqueta="Nombre" name="nombre" autoComplete="name" placeholder="Tu nombre" value={form.nombre} error={errores.nombre} onChange={(evento) => cambiar("nombre", evento.target.value)} />
                <Campo etiqueta="Correo" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" value={form.email} error={errores.email} onChange={(evento) => cambiar("email", evento.target.value)} />
                <Campo etiqueta="WhatsApp (opcional)" name="telefono" type="tel" autoComplete="tel" placeholder="3001234567" value={form.telefono} error={errores.telefono} onChange={(evento) => cambiar("telefono", evento.target.value)} />
                <Campo etiqueta="Contraseña" name="password" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={form.password} error={errores.password} onChange={(evento) => cambiar("password", evento.target.value)} />
                <Campo etiqueta="Confirmar contraseña" name="confirmacion" type="password" autoComplete="new-password" placeholder="Repite tu contraseña" value={form.confirmacion} error={errores.confirmacion} onChange={(evento) => cambiar("confirmacion", evento.target.value)} />
                {error && <Aviso tipo="error">{error}</Aviso>}
                <Boton type="submit" className="w-full py-3" cargando={enviando}>Crear cuenta</Boton>
                <p className="text-center text-sm text-slate-600">
                    ¿Ya tienes cuenta? <Link to="/login" state={location.state} className="font-bold text-ink underline">Inicia sesión</Link>
                </p>
            </form>
        </AuthLayout>
    )
}
