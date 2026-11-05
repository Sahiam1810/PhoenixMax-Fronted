import type { ApiResponse, Plataforma } from "../types"
import { plataformasMock } from "../mocks/servicios/plataformasMock"
import { plataformasConocidas } from "./api/plataformasConocidas"
import { elegir } from "./modo"

export interface PlataformasService {
    listar: () => Promise<ApiResponse<Plataforma[]>>
}

const plataformasApi: PlataformasService = {
    listar: async () => {
        const plataformas = await plataformasConocidas()
        return { message: "Plataformas obtenidas", data: plataformas.filter((item) => item.activo) }
    }
}

export const plataformasService: PlataformasService = elegir(plataformasMock, plataformasApi)
