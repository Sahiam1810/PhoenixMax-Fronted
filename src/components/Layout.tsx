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
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#0c0d10] text-ink dark:text-neutral-100 transition-colors relative">
            <Header />
            <main className="flex-1 relative">
                {pathname !== "/" && (
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.2] z-0"
                        style={{
                            backgroundImage: "radial-gradient(#94a3b8 1.2px, transparent 1.2px)",
                            backgroundSize: "28px 28px"
                        }}
                    />
                )}
                <div className="relative z-10">
                    <Outlet />
                </div>
            </main>
            <Footer />
            <WhatsAppButton />
        </div>
    )
}

export function LayoutContenido() {
    return (
        <Contenedor className="pt-8 pb-16 sm:pt-12 sm:pb-24">
            <Outlet />
        </Contenedor>
    )
}
