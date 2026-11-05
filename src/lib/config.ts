const numero = import.meta.env.VITE_WHATSAPP_NUMERO ?? "573000000000"

export function enlaceWhatsApp(mensaje = "Hola PhoenixMax, necesito ayuda") {
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}
