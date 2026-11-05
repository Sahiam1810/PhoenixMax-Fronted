export type Errores<T> = Partial<Record<keyof T, string>>

export function esEmail(valor: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())
}

export function sinErrores<T>(errores: Errores<T>) {
    return Object.values(errores).every((valor) => !valor)
}
