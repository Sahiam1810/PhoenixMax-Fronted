const numero = import.meta.env.VITE_WHATSAPP_NUMERO ?? "3167168440"

export function enlaceWhatsApp(mensaje = "Hola PhoenixMax, necesito ayuda") {
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}
