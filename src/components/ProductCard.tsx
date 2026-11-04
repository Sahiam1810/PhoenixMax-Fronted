import type { Producto } from "../types"
export function ProductCard({ producto }: { producto: Producto }) {
    return <article className="rounded-xl border bg-white p-4 shadow-sm"><p className="font-semibold">{producto.plataforma}</p><p>{producto.modalidad} · {producto.duracion}</p><p className="mt-2 font-bold">${producto.precio}</p><p>Stock: {producto.stock}</p>{producto.stock === 0 && <span className="mt-2 inline-block rounded bg-red-100 px-2 py-1 text-sm text-red-700">Agotado</span>}</article>
}
