import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Footer } from "./Footer"
import { Header } from "./Header"
import { Contenedor } from "./ui"
import { WhatsAppButton } from "./WhatsAppButton"

export function Layout() {
    const { pathname, hash } = useLocation()

    useEffect(() => {
        if (hash) {
            document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" })
            return
        }
        window.scrollTo(0, 0)
    }, [pathname, hash])

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <WhatsAppButton />
        </div>
    )
}

export function LayoutContenido() {
    return (
        <Contenedor className="pt-8 sm:pt-12">
            <Outlet />
        </Contenedor>
    )
}
