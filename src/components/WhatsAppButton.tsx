import { enlaceWhatsApp } from "../lib/config"
import { IconoWhatsApp } from "./iconos"

export function WhatsAppButton() {
    return (
        <a
            href={enlaceWhatsApp()}
            target="_blank"
            rel="noreferrer"
            aria-label="Escríbenos por WhatsApp"
            className="fixed bottom-4 right-4 z-20 grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform duration-150 hover:scale-105 sm:bottom-6 sm:right-6"
        >
            <IconoWhatsApp className="size-7" />
        </a>
    )
}
