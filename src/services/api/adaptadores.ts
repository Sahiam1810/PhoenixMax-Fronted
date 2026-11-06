import type { Carrito, CarritoItem, Categoria, Compra, CompraItem, Cuenta, EstadoCompra, EstadoCuenta, EstadoPantalla, Paginado, Plataforma, Producto, Rol, Servicio, TipoProducto, Usuario } from "../../types"

export type Dinero = string | number

export interface PlataformaDto {
    id?: number
    nombre: string
    descripcion?: string | null
    logoUrl?: string | null
    maxPantallas?: number
    activo?: boolean
    categoria?: Categoria
    color?: string
}

export interface ProductoDto {
    id: number
    plataformaId: number
    tipo: TipoProducto
    duracionDias: number
    precio: Dinero
    stock?: number
    activo?: boolean
    plataforma?: PlataformaDto
}

export interface ProductoResumenDto {
    tipo: TipoProducto
    duracionDias: number
    plataforma?: PlataformaDto
}

export interface CarritoItemDto {
    id: number
    productoId: number
    cantidad: number
    precioUnitario: Dinero
    subtotal: Dinero
    stock?: number
    producto: ProductoResumenDto
}

export interface CarritoDto {
    items: CarritoItemDto[]
    total: Dinero
    totalItems?: number
}

export interface CompraItemDto {
    id: number
    productoId: number
    cantidad: number
    precioUnitario: Dinero
    subtotal: Dinero
    producto: ProductoResumenDto
}

export interface CompraDto {
    id: number
    usuarioId?: number
    usuario?: { id?: number, nombre?: string, email?: string }
    estado: EstadoCompra
    total: Dinero
    metodoPago: string | null
    pagadaAt: string | null
    createdAt: string
    items?: CompraItemDto[]
}

export interface ServicioDto {
    id: number
    compraId?: number
    plataforma: PlataformaDto
    tipo: TipoProducto
    emailAcceso: string | null
    passwordAcceso: string | null
    nombrePerfil: string | null
    pin: string | null
    fechaInicio: string
    fechaVencimiento: string
    diasRestantes?: number
    estado: "activo" | "por_vencer" | "vencido"
}

export interface UsuarioDto {
    id: number
    nombre: string
    email: string
    telefono: string | null
    rol: Rol
    activo?: boolean
    createdAt?: string
}

export interface PantallaDto {
    id: number
    nombrePerfil: string
    pin?: string | null
    estado: EstadoPantalla
}

export interface CuentaDto {
    id: number
    plataformaId: number
    plataforma?: PlataformaDto
    emailAcceso: string
    estado: EstadoCuenta
    createdAt?: string
    pantallasTotal?: number
    pantallasVendidas?: number
    pantallas?: PantallaDto[]
}

const coloresConocidos: Record<string, string> = {
    netflix: "#e50914",
    disney: "#113ccf",
    primevideo: "#00a8e1",
    max: "#5822b4",
    hbomax: "#5822b4",
    chatgptplus: "#10a37f",
    chatgpt: "#10a37f",
    canvapro: "#00c4cc",
    canva: "#00c4cc",
    capcutpro: "#25c2c9",
    capcut: "#25c2c9",
    spotify: "#1db954",
    youtubepremium: "#ff0000",
    crunchyroll: "#f47521",
    paramount: "#0064ff"
}

const categoriasConocidas: Record<string, Categoria> = {
    chatgptplus: "ia",
    chatgpt: "ia",
    gemini: "ia",
    claude: "ia",
    canvapro: "edicion",
    canva: "edicion",
    capcutpro: "edicion",
    capcut: "edicion",
    adobe: "edicion"
}

const paleta = ["#ff7a1a", "#2563eb", "#16a34a", "#9333ea", "#dc2626", "#0891b2", "#ca8a04"]

export function slug(nombre: string) {
    return nombre.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function colorPara(nombre: string) {
    const clave = slug(nombre)
    if (coloresConocidos[clave]) return coloresConocidos[clave]
    const suma = [...clave].reduce((total, letra) => total + letra.charCodeAt(0), 0)
    return paleta[suma % paleta.length]
}

export function dinero(valor: Dinero | null | undefined) {
    const numero = Number(valor ?? 0)
    return Number.isFinite(numero) ? numero : 0
}

export function lista<T>(data: T[] | Paginado<T>): T[] {
    return Array.isArray(data) ? data : data.data
}

export function aPlataforma(dto: PlataformaDto, conocidas: Plataforma[] = []): Plataforma {
    const conocida = conocidas.find((item) => (dto.id !== undefined && item.id === dto.id) || (dto.nombre !== "" && item.nombre === dto.nombre))
    const nombre = dto.nombre || conocida?.nombre || "Plataforma"
    const clave = slug(nombre)
    return {
        id: dto.id ?? conocida?.id ?? 0,
        nombre,
        descripcion: dto.descripcion ?? conocida?.descripcion ?? "",
        logoUrl: dto.logoUrl ?? conocida?.logoUrl ?? `/logos/${clave}.svg`,
        color: dto.color ?? conocida?.color ?? colorPara(nombre),
        categoria: dto.categoria ?? conocida?.categoria ?? categoriasConocidas[clave] ?? "streaming",
        maxPantallas: dto.maxPantallas ?? conocida?.maxPantallas ?? 1,
        activo: dto.activo ?? conocida?.activo ?? true
    }
}

export function aProducto(dto: ProductoDto, plataformas: Plataforma[]): Producto {
    const plataforma = aPlataforma({ id: dto.plataformaId, nombre: "", ...dto.plataforma }, plataformas)
    return {
        id: dto.id,
        plataformaId: dto.plataformaId,
        plataforma,
        tipo: dto.tipo,
        duracionDias: dto.duracionDias,
        precio: dinero(dto.precio),
        stock: dto.stock ?? 0,
        activo: dto.activo ?? true
    }
}

function productoDeResumen(productoId: number, resumen: ProductoResumenDto, precioUnitario: Dinero, stock: number, plataformas: Plataforma[]): Producto {
    const plataforma = aPlataforma({ nombre: "", ...resumen.plataforma }, plataformas)
    return {
        id: productoId,
        plataformaId: plataforma.id,
        plataforma,
        tipo: resumen.tipo,
        duracionDias: resumen.duracionDias,
        precio: dinero(precioUnitario),
        stock,
        activo: true
    }
}

export function aCarrito(dto: CarritoDto, plataformas: Plataforma[]): Carrito {
    const items: CarritoItem[] = dto.items.map((item) => ({
        id: item.id,
        producto: productoDeResumen(item.productoId, item.producto, item.precioUnitario, item.stock ?? 0, plataformas),
        cantidad: item.cantidad,
        subtotal: dinero(item.subtotal)
    }))
    return { items, total: dinero(dto.total) }
}

export function aCompra(dto: CompraDto, plataformas: Plataforma[]): Compra {
    const listaItems = dto.items ?? (dto as unknown as { compraItems?: CompraItemDto[] }).compraItems ?? []
    const items: CompraItem[] = listaItems.map((item) => ({
        id: item.id,
        producto: productoDeResumen(item.productoId, item.producto, item.precioUnitario, 0, plataformas),
        cantidad: item.cantidad,
        precioUnitario: dinero(item.precioUnitario),
        subtotal: dinero(item.subtotal)
    }))
    return {
        id: dto.id,
        usuarioId: dto.usuarioId ?? dto.usuario?.id ?? 0,
        usuarioNombre: dto.usuario?.nombre ?? dto.usuario?.email ?? "",
        total: dinero(dto.total),
        estado: dto.estado,
        metodoPago: dto.metodoPago ?? "",
        createdAt: dto.createdAt,
        pagadaAt: dto.pagadaAt,
        items
    }
}

export function aServicio(dto: ServicioDto, plataformas: Plataforma[]): Servicio {
    return {
        id: dto.id,
        compraId: dto.compraId ?? 0,
        plataforma: aPlataforma(dto.plataforma, plataformas),
        tipo: dto.tipo,
        emailAcceso: dto.emailAcceso,
        passwordAcceso: dto.passwordAcceso,
        nombrePerfil: dto.nombrePerfil,
        pin: dto.pin,
        fechaInicio: dto.fechaInicio,
        fechaVencimiento: dto.fechaVencimiento,
        diasRestantes: dto.diasRestantes ?? 0,
        estado: dto.estado
    }
}

export function aUsuario(dto: UsuarioDto): Usuario {
    return {
        id: dto.id,
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono ?? "",
        rol: dto.rol,
        activo: dto.activo ?? true,
        createdAt: dto.createdAt ?? ""
    }
}

export function aCuenta(dto: CuentaDto, plataformas: Plataforma[]): Cuenta {
    return {
        id: dto.id,
        plataforma: aPlataforma({ id: dto.plataformaId, nombre: "", ...dto.plataforma }, plataformas),
        emailAcceso: dto.emailAcceso,
        estado: dto.estado,
        createdAt: dto.createdAt ?? "",
        pantallas: (dto.pantallas ?? []).map((pantalla) => ({ ...pantalla, pin: pantalla.pin ?? "", cuentaId: dto.id }))
    }
}
