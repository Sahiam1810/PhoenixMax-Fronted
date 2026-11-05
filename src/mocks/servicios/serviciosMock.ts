import type { ServiciosService } from "../../services/serviciosService"
import { db, ok, servicioCompleto, usuarioSesion } from ".."

export const serviciosMock: ServiciosService = {
    mios: async () => {
        const base = db()
        const usuario = usuarioSesion(base)
        const servicios = base.servicios
            .filter((item) => item.usuarioId === usuario.id)
            .map((item) => servicioCompleto(base, item))
            .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento))
        return ok(servicios)
    }
}
