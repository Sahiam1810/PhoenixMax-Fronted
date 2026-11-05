import type { PlataformasService } from "../../services/plataformasService"
import { db, ok } from ".."

export const plataformasMock: PlataformasService = {
    listar: async () => ok(db().plataformas.filter((item) => item.activo))
}
