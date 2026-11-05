import { useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { ProductCard } from "../components/ProductCard"
import { Aviso, Cargando, TituloSeccion, Vacio } from "../components/ui"
import { useCarga } from "../hooks/useCarga"
import { etiquetaCategoria, etiquetaTipo } from "../lib/formato"
import { plataformasService } from "../services/plataformasService"
import { productosService } from "../services/productosService"
import type { Categoria, TipoProducto } from "../types"

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
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors duration-150 ${activo ? "border-ink bg-ink text-white" : "border-slate-300 bg-white hover:border-ink"}`}
        >
            {children}
        </button>
    )
}

export function Catalogo() {
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
        setParams(siguiente, { replace: true })
    }

    const plataformasVisibles = (plataformas.data ?? []).filter((item) => !categoria || item.categoria === categoria)
    const lista = productos.data ?? []

    return (
        <div>
            <TituloSeccion>Catálogo</TituloSeccion>
            <div className="mb-6 space-y-3">
                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                    <Chip activo={!categoria} onClick={() => cambiar("categoria")}>Todas</Chip>
                    {categorias.map((item) => (
                        <Chip key={item} activo={categoria === item} onClick={() => cambiar("categoria", item)}>{etiquetaCategoria[item]}</Chip>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                    <label className="sm:w-56">
                        <span className="sr-only">Plataforma</span>
                        <select value={plataforma ?? ""} onChange={(evento) => cambiar("plataforma", evento.target.value ? Number(evento.target.value) : undefined)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                            <option value="">Todas las plataformas</option>
                            {plataformasVisibles.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
                        </select>
                    </label>
                    <label className="sm:w-56">
                        <span className="sr-only">Modalidad</span>
                        <select value={tipo ?? ""} onChange={(evento) => cambiar("tipo", evento.target.value || undefined)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                            <option value="">Todas las modalidades</option>
                            {tipos.map((item) => <option key={item} value={item}>{etiquetaTipo[item]}</option>)}
                        </select>
                    </label>
                    {!productos.cargando && <p className="col-span-2 text-sm text-slate-500 sm:ml-auto">{lista.length} productos</p>}
                </div>
            </div>
            {productos.cargando && <Cargando texto="Cargando productos..." />}
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
