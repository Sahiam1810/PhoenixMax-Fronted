export type Role = "cliente" | "admin"

export interface Usuario {
    id: string
    nombre: string
    email: string
    rol: Role
}

export interface Plataforma {
    id: string
    nombre: string
    logo?: string
    activa: boolean
}

export interface Producto {
    id: string
    plataformaId: string
    plataforma: string
    modalidad: string
    duracion: string
    precio: string
    stock: number
    maxPantallas: number
}

export interface CarritoItem {
    id: string
    productoId: string
    producto: Producto
    cantidad: number
}

export interface Servicio {
    id: string
    productoId: string
    plataforma: string
    fechaVencimiento: string
    estado: "activo" | "proximo" | "vencido"
    credenciales: string
}

export interface Compra {
    id: string
    total: string
    estado: string
    fecha: string
}

export interface ApiResponse<T> {
    message: string
    data: T
}

export interface PaginatedData<T> {
    previousPage: number | null
    currentPage: number
    nextPage: number | null
    total: number
    totalPages: number
    limit: number
    data: T[]
}

export interface ApiError {
    error: string
    errors?: Record<string, string[]>
}

export interface LoginInput {
    email: string
    password: string
}

export interface RegisterInput extends LoginInput {
    nombre: string
}
