import type { ApiResponse, Servicio } from "../types"
import { request } from "./http"
export const serviciosService = { mios: (): Promise<ApiResponse<Servicio[]>> => request("/servicios/mios") }
