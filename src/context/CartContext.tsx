import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { carritoService } from "../services/carritoService"
import type { ApiResponse, Carrito } from "../types"
import { useAuth } from "./AuthContext"

interface CartContextValue {
    carrito: Carrito
    contador: number
    cargando: boolean
    recargar: () => Promise<void>
    agregar: (productoId: number, cantidad: number) => Promise<string>
    actualizar: (itemId: number, cantidad: number) => Promise<string>
    eliminar: (itemId: number) => Promise<string>
    vaciar: () => Promise<string>
}

const vacio: Carrito = { items: [], total: 0 }

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const { usuario } = useAuth()
    const [carrito, setCarrito] = useState<Carrito>(vacio)
    const [cargando, setCargando] = useState(false)
    const esCliente = usuario?.rol === "cliente"

    const recargar = useCallback(async () => {
        if (!esCliente) {
            setCarrito(vacio)
            return
        }
        setCargando(true)
        try {
            const respuesta = await carritoService.obtener()
            setCarrito(respuesta.data)
        } finally {
            setCargando(false)
        }
    }, [esCliente])

    useEffect(() => {
        recargar().catch(() => setCarrito(vacio))
    }, [recargar, usuario?.id])

    const aplicar = useCallback(async (operacion: Promise<ApiResponse<Carrito>>) => {
        const respuesta = await operacion
        setCarrito(respuesta.data)
        return respuesta.message
    }, [])

    const value = useMemo<CartContextValue>(() => ({
        carrito,
        contador: carrito.items.reduce((total, item) => total + item.cantidad, 0),
        cargando,
        recargar,
        agregar: (productoId, cantidad) => aplicar(carritoService.agregar(productoId, cantidad)),
        actualizar: (itemId, cantidad) => aplicar(carritoService.actualizar(itemId, cantidad)),
        eliminar: (itemId) => aplicar(carritoService.eliminar(itemId)),
        vaciar: () => aplicar(carritoService.vaciar())
    }), [aplicar, cargando, carrito, recargar])

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error("useCart debe usarse dentro de CartProvider")
    return context
}
