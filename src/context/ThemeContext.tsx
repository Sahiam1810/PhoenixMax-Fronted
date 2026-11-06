import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type Tema = "claro" | "oscuro"

interface ThemeContextType {
    tema: Tema
    esOscuro: boolean
    alternarTema: () => void
    establecerTema: (nuevo: Tema) => void
}

const CLAVE_STORAGE = "phoenix_tema"

const ThemeContext = createContext<ThemeContextType | null>(null)

function obtenerTemaInicial(): Tema {
    if (typeof window === "undefined") return "claro"
    const guardado = localStorage.getItem(CLAVE_STORAGE)
    if (guardado === "claro" || guardado === "oscuro") return guardado
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [tema, setTema] = useState<Tema>(obtenerTemaInicial)

    useEffect(() => {
        const raiz = document.documentElement
        if (tema === "oscuro") {
            raiz.classList.add("dark")
            raiz.style.colorScheme = "dark"
        } else {
            raiz.classList.remove("dark")
            raiz.style.colorScheme = "light"
        }
        localStorage.setItem(CLAVE_STORAGE, tema)
    }, [tema])

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const alCambiar = (e: MediaQueryListEvent) => {
            const guardado = localStorage.getItem(CLAVE_STORAGE)
            if (!guardado) {
                setTema(e.matches ? "oscuro" : "claro")
            }
        }
        mediaQuery.addEventListener("change", alCambiar)
        return () => mediaQuery.removeEventListener("change", alCambiar)
    }, [])

    const alternarTema = () => {
        setTema((actual) => (actual === "oscuro" ? "claro" : "oscuro"))
    }

    const establecerTema = (nuevo: Tema) => {
        setTema(nuevo)
    }

    return (
        <ThemeContext.Provider value={{ tema, esOscuro: tema === "oscuro", alternarTema, establecerTema }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextType {
    const contexto = useContext(ThemeContext)
    if (!contexto) {
        throw new Error("useTheme debe usarse dentro de un ThemeProvider")
    }
    return contexto
}

