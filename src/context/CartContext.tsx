import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { CarritoItem } from "../types"

interface CartContextValue {
    items: CarritoItem[]
    contador: number
    setItems: (items: CarritoItem[]) => void
}
const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CarritoItem[]>([])
    const value = useMemo(() => ({ items, contador: items.reduce((total, item) => total + item.cantidad, 0), setItems }), [items])
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error("useCart debe usarse dentro de CartProvider")
    return context
}
