import { Link } from "react-router-dom"

export function NoEncontrado() {
    return (
        <div className="py-20 text-center">
            <p className="text-6xl font-extrabold text-brand">404</p>
            <h1 className="mt-4 text-xl font-bold">Esta página no existe</h1>
            <p className="mt-2 text-sm text-slate-500">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
            <Link to="/" className="mt-6 inline-block rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white">Volver al inicio</Link>
        </div>
    )
}
