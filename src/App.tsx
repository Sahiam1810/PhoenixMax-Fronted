import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import { AppRouter } from "./routes"

export function App() {
    return <BrowserRouter><AuthProvider><CartProvider><AppRouter /></CartProvider></AuthProvider></BrowserRouter>
}
