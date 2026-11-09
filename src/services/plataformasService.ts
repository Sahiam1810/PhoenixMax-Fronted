import type { ApiResponse, Plataforma } from "../types"
import { aPlataforma, type PlataformaDto } from "./api/adaptadores"
import { todas } from "./http"

export interface PlataformasService {
    listar: () => Promise<ApiResponse<Plataforma[]>>
}

const plataformasApi: PlataformasService = {
    listar: async () => {
        const respuesta = await todas<PlataformaDto>("/plataformas")
        return { message: respuesta.message, data: respuesta.data.map((item) => aPlataforma(item)).filter((item) => item.activo) }
    }
}

export const plataformasService: PlataformasService = plataformasApi
