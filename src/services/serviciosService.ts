import type { ApiResponse, Servicio } from "../types"
import { aServicio, type ServicioDto } from "./api/adaptadores"
import { plataformasConocidas } from "./api/plataformasConocidas"
import { request } from "./http"

export interface ServiciosService {
    mios: () => Promise<ApiResponse<Servicio[]>>
}

const serviciosApi: ServiciosService = {
    mios: async () => {
        const [respuesta, plataformas] = await Promise.all([request<ServicioDto[]>("/servicios/mios"), plataformasConocidas()])
        return { message: respuesta.message, data: respuesta.data.map((item) => aServicio(item, plataformas)) }
    }
}

export const serviciosService: ServiciosService = serviciosApi
