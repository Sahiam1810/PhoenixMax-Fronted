import type { AuthService } from "../../services/authService"
import { db, fallo, ok, siguienteId, sinPassword, transaccion, usuarioSesion } from ".."

export const authMock: AuthService = {
    register: async (input) => {
        const email = input.email.trim().toLowerCase()
        if (db().usuarios.some((item) => item.email === email)) fallo("Ya existe una cuenta con ese correo", 409)
        const usuario = transaccion((base) => {
            const nuevo = {
                id: siguienteId(base.usuarios),
                nombre: input.nombre.trim(),
                email,
                telefono: input.telefono.trim(),
                rol: "cliente" as const,
                activo: true,
                createdAt: new Date().toISOString(),
                password: input.password
            }
            base.usuarios.push(nuevo)
            return nuevo
        })
        return ok({ usuario: sinPassword(usuario), token: `mock.${usuario.id}` }, "Cuenta creada")
    },
    login: async (input) => {
        const usuario = db().usuarios.find((item) => item.email === input.email.trim().toLowerCase())
        if (!usuario || usuario.password !== input.password) fallo("Correo o contraseña incorrectos", 401)
        if (!usuario.activo) fallo("Tu usuario está desactivado. Escríbenos a soporte", 403)
        return ok({ usuario: sinPassword(usuario), token: `mock.${usuario.id}` }, "Bienvenido")
    },
    me: async () => ok(sinPassword(usuarioSesion())),
    actualizarPerfil: async (input) => {
        const usuario = transaccion((base) => {
            const actual = usuarioSesion(base)
            actual.nombre = input.nombre.trim()
            actual.telefono = input.telefono.trim()
            return actual
        })
        return ok(sinPassword(usuario), "Perfil actualizado")
    }
}
