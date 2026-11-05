export type Rol = "cliente" | "admin"
export type Categoria = "streaming" | "ia" | "edicion"
export type TipoProducto = "cuenta" | "pantalla"
export type EstadoCuenta = "disponible" | "parcial" | "vendida" | "inactiva"
export type EstadoPantalla = "disponible" | "vendida"
export type EstadoCompra = "pendiente" | "pagada" | "cancelada"
export type EstadoServicio = "activo" | "vencido"
export type EstadoVisualServicio = "activo" | "por_vencer" | "vencido"

export interface Usuario {
    id: number
    nombre: string
    email: string
    telefono: string
    rol: Rol
    activo: boolean
    createdAt: string
}

export interface Plataforma {
    id: number
    nombre: string
    descripcion: string
    logoUrl: string
    color: string
    categoria: Categoria
    maxPantallas: number
    activo: boolean
}

export interface Producto {
    id: number
    plataformaId: number
    plataforma: Plataforma
    tipo: TipoProducto
    duracionDias: number
    precio: number
    stock: number
    activo: boolean
}

export interface CarritoItem {
    id: number
    producto: Producto
    cantidad: number
    subtotal: number
}

export interface Carrito {
    items: CarritoItem[]
    total: number
}

export interface CompraItem {
    id: number
    producto: Producto
    cantidad: number
    precioUnitario: number
    subtotal: number
}

export interface Compra {
    id: number
    usuarioId: number
    usuarioNombre: string
    total: number
    estado: EstadoCompra
    metodoPago: string
    createdAt: string
    pagadaAt: string | null
    items: CompraItem[]
}

export interface Servicio {
    id: number
    compraId: number
    plataforma: Plataforma
    tipo: TipoProducto
    emailAcceso: string
    passwordAcceso: string
    nombrePerfil: string | null
    pin: string | null
    fechaInicio: string
    fechaVencimiento: string
    estado: EstadoServicio
}

export interface Pantalla {
    id: number
    cuentaId: number
    nombrePerfil: string
    pin: string
    estado: EstadoPantalla
}

export interface Cuenta {
    id: number
    plataforma: Plataforma
    emailAcceso: string
    estado: EstadoCuenta
    createdAt: string
    pantallas: Pantalla[]
}

export interface StockPlataforma {
    plataforma: Plataforma
    stockCuentas: number
    stockPantallas: number
}

export interface Resumen {
    ventasHoy: number
    ventasMes: number
    comprasHoy: number
    comprasMes: number
    clientes: number
    stock: StockPlataforma[]
}

export interface ApiResponse<T> {
    ok: boolean
    message: string
    data: T
}

export interface ApiErrorBody {
    ok: false
    message: string
    errors?: Record<string, string[]>
}

export interface LoginInput {
    email: string
    password: string
}

export interface RegisterInput extends LoginInput {
    nombre: string
    telefono: string
}

export interface PerfilInput {
    nombre: string
    telefono: string
}

export interface AuthResult {
    usuario: Usuario
    token: string
}

export interface ProductosFiltro {
    plataforma?: number
    tipo?: TipoProducto
    categoria?: Categoria
}

export interface CuentaInput {
    plataformaId: number
    emailAcceso: string
    passwordAcceso: string
}

export interface CuentasFiltro {
    plataforma?: number
    estado?: EstadoCuenta
}

export interface PlataformaInput {
    nombre: string
    descripcion: string
    color: string
    categoria: Categoria
    maxPantallas: number
    activo: boolean
}

export interface ProductoInput {
    plataformaId: number
    tipo: TipoProducto
    duracionDias: number
    precio: number
    activo: boolean
}

export interface UsuarioInput {
    nombre: string
    email: string
    telefono: string
    password: string
    rol: Rol
}

export interface UsuariosFiltro {
    rol?: Rol
    activo?: boolean
    busqueda?: string
}

export interface ComprasFiltro {
    estado?: EstadoCompra
    desde?: string
    hasta?: string
}
