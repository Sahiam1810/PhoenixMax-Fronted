import type { Plataforma } from "../../types"
import { todas } from "../http"
import { aPlataforma, type PlataformaDto } from "./adaptadores"

const VIGENCIA = 60000

let cache: { momento: number, datos: Promise<Plataforma[]> } | null = null

export function plataformasConocidas(): Promise<Plataforma[]> {
    if (cache && Date.now() - cache.momento < VIGENCIA) return cache.datos
    const datos = todas<PlataformaDto>("/plataformas")
        .then((respuesta) => respuesta.data.map((item) => aPlataforma(item)))
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
