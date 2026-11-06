import { BrowserRouter } from "react-router-dom"
import { AvisoModo } from "./components/AvisoModo"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { ThemeProvider } from "./context/ThemeContext"
import { AppRouter } from "./routes"

export function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <AppRouter />
                        <AvisoModo />
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    )
}
