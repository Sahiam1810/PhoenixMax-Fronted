import type { ReactNode, SVGProps } from "react"

type Props = SVGProps<SVGSVGElement>

function Base({ children, ...props }: Props & { children: ReactNode }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
            {children}
        </svg>
    )
}

export function IconoUsuario(props: Props) {
    return (
        <Base {...props}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </Base>
    )
}

export function IconoCarrito(props: Props) {
    return (
        <Base {...props}>
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
            <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.8L21 7H6" />
        </Base>
    )
}

export function IconoChevron(props: Props) {
    return (
        <Base {...props}>
            <path d="m6 9 6 6 6-6" />
        </Base>
    )
}

export function IconoAtras(props: Props) {
    return (
        <Base {...props}>
            <path d="m15 18-6-6 6-6" />
        </Base>
    )
}

export function IconoMas(props: Props) {
    return (
        <Base {...props}>
            <path d="M12 5v14M5 12h14" />
        </Base>
    )
}

export function IconoMenos(props: Props) {
    return (
        <Base {...props}>
            <path d="M5 12h14" />
        </Base>
    )
}

export function IconoBasura(props: Props) {
    return (
        <Base {...props}>
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
        </Base>
    )
}

export function IconoCopiar(props: Props) {
    return (
        <Base {...props}>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h8" />
        </Base>
    )
}

export function IconoCheck(props: Props) {
    return (
        <Base {...props}>
            <path d="m5 12 5 5L20 7" />
        </Base>
    )
}

export function IconoEscudo(props: Props) {
    return (
        <Base {...props}>
            <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
            <path d="m9 12 2 2 4-4" />
        </Base>
    )
}

export function IconoSoporte(props: Props) {
    return (
        <Base {...props}>
            <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
            <rect x="3" y="14" width="4" height="6" rx="1" />
            <rect x="17" y="14" width="4" height="6" rx="1" />
        </Base>
    )
}

export function IconoRayo(props: Props) {
    return (
        <Base {...props}>
            <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        </Base>
    )
}

export function IconoBolsa(props: Props) {
    return (
        <Base {...props}>
            <path d="M5 8h14l-1 13H6z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </Base>
    )
}

export function IconoOjo(props: Props) {
    return (
        <Base {...props}>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
        </Base>
    )
}

export function IconoFiltro(props: Props) {
    return (
        <Base {...props}>
            <path d="M3 5h18l-7 8v6l-4 2v-8z" />
        </Base>
    )
}

export function IconoWhatsApp(props: Props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
        </svg>
    )
}

export function LogoAlas(props: Props) {
    return (
        <svg viewBox="0 0 48 40" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" aria-hidden="true" {...props}>
            <path d="M4 6c10 4 22 9 36 16" />
            <path d="M22 4c0 6 6 12 18 18" />
            <path d="M8 22c10 0 20-1 32 0" />
            <path d="M18 34c8 0 16-6 22-12" />
        </svg>
    )
}
