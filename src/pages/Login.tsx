import { useState, type FormEvent } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { AuthLayout } from "../components/AuthLayout"
import { Aviso, Boton, Campo } from "../components/ui"
import { useAuth } from "../context/AuthContext"
import { esEmail, sinErrores, type Errores } from "../lib/validacion"
import { authService } from "../services/authService"
import { mensajeError, usarMocks } from "../services/http"
import type { LoginInput } from "../types"

function rutaDestino(estado: unknown) {
    if (estado && typeof estado === "object" && "desde" in estado && typeof estado.desde === "string") return estado.desde
    return null
}

export function Login() {
    const { usuario, iniciarSesion } = useAuth()
    const location = useLocation()
    const [form, setForm] = useState<LoginInput>({ email: "", password: "" })
    const [errores, setErrores] = useState<Errores<LoginInput>>({})
    const [error, setError] = useState("")
    const [enviando, setEnviando] = useState(false)
    const desde = rutaDestino(location.state)

    if (usuario) return <Navigate to={desde ?? (usuario.rol === "admin" ? "/admin" : "/")} replace />

    const enviar = async (evento: FormEvent) => {
        evento.preventDefault()
        const nuevos: Errores<LoginInput> = {
            email: !form.email.trim() ? "Escribe tu correo" : !esEmail(form.email) ? "El correo no es válido" : undefined,
            password: !form.password ? "Escribe tu contraseña" : undefined
        }
        setErrores(nuevos)
        if (!sinErrores(nuevos)) return
        setEnviando(true)
        setError("")
        try {
            const { data } = await authService.login(form)
            iniciarSesion(data.usuario, data.token)
        } catch (fallo) {
            setError(mensajeError(fallo))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <AuthLayout titulo="Iniciar sesión" subtitulo="Entra para comprar y ver tus servicios">
            <form onSubmit={enviar} noValidate className="space-y-4">
                {desde && <Aviso tipo="info">Inicia sesión para continuar con tu compra.</Aviso>}
                <Campo etiqueta="Correo" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" value={form.email} error={errores.email} onChange={(evento) => setForm({ ...form, email: evento.target.value })} />
                <Campo etiqueta="Contraseña" name="password" type="password" autoComplete="current-password" placeholder="••••••••" value={form.password} error={errores.password} onChange={(evento) => setForm({ ...form, password: evento.target.value })} />
                {error && <Aviso tipo="error">{error}</Aviso>}
                <Boton type="submit" className="w-full py-3" cargando={enviando}>Entrar</Boton>
                <p className="text-center text-sm text-slate-600">
                    ¿No tienes cuenta? <Link to="/registro" state={location.state} className="font-bold text-ink underline">Regístrate</Link>
                </p>
                {usarMocks && (
                    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                        <p className="font-semibold text-slate-700">Usuarios de prueba</p>
                        <p>Cliente: cliente@phoenixmax.test / Cliente123</p>
                        <p>Admin: admin@phoenixmax.test / Admin123</p>
                    </div>
                )}
            </form>
        </AuthLayout>
    )
}
