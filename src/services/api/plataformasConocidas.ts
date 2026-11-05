import type { Paginado, Plataforma } from "../../types"
import { request } from "../http"
import { aPlataforma, lista, type PlataformaDto } from "./adaptadores"

const VIGENCIA = 60000

let cache: { momento: number, datos: Promise<Plataforma[]> } | null = null

export function plataformasConocidas(): Promise<Plataforma[]> {
    if (cache && Date.now() - cache.momento < VIGENCIA) return cache.datos
    const datos = request<PlataformaDto[] | Paginado<PlataformaDto>>("/plataformas?limit=100")
        .then((respuesta) => lista(respuesta.data).map((item) => aPlataforma(item)))
        .catch(() => {
            cache = null
            return []
        })
    cache = { momento: Date.now(), datos }
    return datos
}

export function olvidarPlataformas() {
    cache = null
}
