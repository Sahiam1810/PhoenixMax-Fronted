import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useCarga } from "../hooks/useCarga"
import { etiquetaCategoria, etiquetaTipo } from "../lib/formato"
import { plataformasService } from "../services/plataformasService"
import { productosService } from "../services/productosService"
import type { Categoria, TipoProducto } from "../types"
import { ProductCard } from "./ProductCard"
import { Aviso, Cargando, IconoPlataforma, Vacio } from "./ui"

const cargarPlataformas = () => plataformasService.listar()
const categorias: Categoria[] = ["streaming", "ia", "edicion"]
const tipos: TipoProducto[] = ["pantalla", "cuenta"]

function esCategoria(valor: string | null): valor is Categoria {
    return valor === "streaming" || valor === "ia" || valor === "edicion"
}

function esTipo(valor: string | null): valor is TipoProducto {
    return valor === "cuenta" || valor === "pantalla"
}

function Chip({ activo, onClick, children }: { activo: boolean, onClick: () => void, children: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={activo}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 ${activo ? "bg-ink text-white" : "bg-suave text-ink hover:bg-brand-100"}`}
        >
            {children}
        </button>
    )
}

export function VistaCatalogo() {
    const [params, setParams] = useSearchParams()
    const categoriaParam = params.get("categoria")
    const tipoParam = params.get("tipo")
    const categoria = esCategoria(categoriaParam) ? categoriaParam : undefined
    const tipo = esTipo(tipoParam) ? tipoParam : undefined
    const plataforma = Number(params.get("plataforma")) || undefined

    const plataformas = useCarga(cargarPlataformas)
    const cargarProductos = useCallback(() => productosService.listar({ categoria, tipo, plataforma }), [categoria, tipo, plataforma])
    const productos = useCarga(cargarProductos)

    const cambiar = (clave: string, valor?: string | number) => {
        const siguiente = new URLSearchParams(params)
        if (valor === undefined) siguiente.delete(clave)
        else siguiente.set(clave, String(valor))
        if (clave === "categoria") siguiente.delete("plataforma")
        setParams(siguiente, { replace: true, preventScrollReset: true })
    }

    const plataformasVisibles = (plataformas.data ?? []).filter((item) => !categoria || item.categoria === categoria)
    const lista = productos.data ?? []

    return (
        <div>
            <div className="mb-8 space-y-4">
                <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                    <Chip activo={!categoria} onClick={() => cambiar("categoria")}>Todas</Chip>
                    {categorias.map((item) => (
                        <Chip key={item} activo={categoria === item} onClick={() => cambiar("categoria", item)}>{etiquetaCategoria[item]}</Chip>
                    ))}
                </div>
                <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
                    {plataformasVisibles.map((item) => {
                        const activa = plataforma === item.id
                        return (
                            <button
                                key={item.id}
                                type="button"
                                aria-pressed={activa}
                                onClick={() => cambiar("plataforma", activa ? undefined : item.id)}
                                className={`flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-2xl p-2 text-center transition-colors duration-150 ${activa ? "bg-ink text-white" : "hover:bg-suave/60"}`}
                            >
                                <IconoPlataforma plataforma={item} className="size-12 rounded-2xl text-lg" />
                                <span className="line-clamp-2 text-[11px] font-semibold leading-tight">{item.nombre}</span>
                            </button>
                        )
                    })}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <label className="w-full sm:w-60">
                        <span className="sr-only">Modalidad</span>
                        <select value={tipo ?? ""} onChange={(evento) => cambiar("tipo", evento.target.value || undefined)} className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm">
                            <option value="">Todas las modalidades</option>
                            {tipos.map((item) => <option key={item} value={item}>{etiquetaTipo[item]}</option>)}
                        </select>
                    </label>
                    {!productos.cargando && <p className="text-sm text-slate-500 sm:ml-auto">{lista.length} productos</p>}
                </div>
            </div>
            {productos.cargando && !productos.data && <Cargando texto="Cargando productos..." />}
            {productos.error && <Aviso tipo="error">{productos.error}</Aviso>}
            {!productos.cargando && !productos.error && lista.length === 0 && (
                <Vacio titulo="No hay productos con esos filtros">Prueba con otra plataforma o modalidad.</Vacio>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {lista.map((producto) => <ProductCard key={producto.id} producto={producto} />)}
            </div>
        </div>
    )
}
