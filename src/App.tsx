import { BrowserRouter } from "react-router-dom"
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
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    )
}
