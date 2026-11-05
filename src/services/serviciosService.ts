import type { ApiResponse, Servicio } from "../types"
import { serviciosMock } from "../mocks/servicios/serviciosMock"
import { request, usarMocks } from "./http"

export interface ServiciosService {
    mios: () => Promise<ApiResponse<Servicio[]>>
}

const serviciosApi: ServiciosService = {
    mios: () => request("/servicios/mios")
}

export const serviciosService: ServiciosService = usarMocks ? serviciosMock : serviciosApi
