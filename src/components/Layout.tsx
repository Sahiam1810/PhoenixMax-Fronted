import { Outlet } from "react-router-dom"
import { Footer } from "./Footer"
import { Header } from "./Header"
import { WhatsAppButton } from "./WhatsAppButton"
export function Layout() { return <div className="flex min-h-screen flex-col"><Header /><main className="mx-auto w-full max-w-6xl flex-1 p-4"><Outlet /></main><Footer /><WhatsAppButton /></div> }
