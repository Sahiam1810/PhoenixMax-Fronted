import type { ApiResponse, Plataforma } from "../types"
import { plataformasMock } from "../mocks/servicios/plataformasMock"
import { request, usarMocks } from "./http"

export interface PlataformasService {
    listar: () => Promise<ApiResponse<Plataforma[]>>
}

const plataformasApi: PlataformasService = {
    listar: () => request("/plataformas")
}

export const plataformasService: PlataformasService = usarMocks ? plataformasMock : plataformasApi
