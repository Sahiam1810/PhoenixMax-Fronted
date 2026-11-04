import type { ApiResponse, Plataforma } from "../types"
import { request } from "./http"
export const plataformasService = { listar: (): Promise<ApiResponse<Plataforma[]>> => request("/plataformas") }
