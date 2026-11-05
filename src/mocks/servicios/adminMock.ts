import type { AdminService } from "../../services/adminService"
import type { StockPlataforma } from "../../types"
import {
    adminSesion,
    compraCompleta,
    crearPantallas,
    cuentaCompleta,
    db,
    diasRestantes,
    fallo,
    ok,
    plataformaDe,
    productoCompleto,
    productoPorId,
    recalcularCuenta,
    siguienteId,
    sinPassword,
    stockDe,
    transaccion
} from ".."

function mismoDia(fecha: Date, otra: Date) {
    return fecha.toDateString() === otra.toDateString()
}

function mismoMes(fecha: Date, otra: Date) {
    return fecha.getFullYear() === otra.getFullYear() && fecha.getMonth() === otra.getMonth()
}

export const adminMock: AdminService = {
    cuentas: async (filtro = {}) => {
        const base = db()
        adminSesion(base)
        const cuentas = base.cuentas
            .filter((item) => !filtro.plataforma || item.plataformaId === filtro.plataforma)
            .filter((item) => !filtro.estado || item.estado === filtro.estado)
            .map((item) => cuentaCompleta(base, item))
        return ok(cuentas)
    },
    crearCuenta: async (input) => {
        const cuenta = transaccion((base) => {
            adminSesion(base)
            plataformaDe(base, input.plataformaId)
            const email = input.emailAcceso.trim().toLowerCase()
            if (base.cuentas.some((item) => item.plataformaId === input.plataformaId && item.emailAcceso === email)) {
                fallo("Esa cuenta ya está registrada en la plataforma", 409)
            }
            const nueva = {
                id: siguienteId(base.cuentas),
                plataformaId: input.plataformaId,
                emailAcceso: email,
                passwordAcceso: input.passwordAcceso,
                estado: "disponible" as const,
                createdAt: new Date().toISOString()
            }
            base.cuentas.push(nueva)
            crearPantallas(base, nueva)
            return cuentaCompleta(base, nueva)
        })
        return ok(cuenta, "Cuenta cargada con sus pantallas")
    },
    cambiarEstadoCuenta: async (id, activa) => {
        const cuenta = transaccion((base) => {
            adminSesion(base)
            const actual = base.cuentas.find((item) => item.id === id)
            if (!actual) fallo("Cuenta no encontrada", 404)
            if (!activa && actual.estado === "vendida") fallo("No se puede desactivar una cuenta vendida")
            if (activa) {
                actual.estado = "disponible"
                recalcularCuenta(base, actual)
            } else {
                actual.estado = "inactiva"
            }
            return cuentaCompleta(base, actual)
        })
        return ok(cuenta, activa ? "Cuenta activada" : "Cuenta desactivada")
    },
    plataformas: async () => {
        adminSesion()
        return ok(db().plataformas)
    },
    crearPlataforma: async (input) => {
        const plataforma = transaccion((base) => {
            adminSesion(base)
            if (base.plataformas.some((item) => item.nombre.toLowerCase() === input.nombre.trim().toLowerCase())) fallo("Ya existe esa plataforma", 409)
            const nueva = { ...input, nombre: input.nombre.trim(), id: siguienteId(base.plataformas), logoUrl: "" }
            base.plataformas.push(nueva)
            return nueva
        })
        return ok(plataforma, "Plataforma creada")
    },
    actualizarPlataforma: async (id, input) => {
        const plataforma = transaccion((base) => {
            adminSesion(base)
            const actual = plataformaDe(base, id)
            Object.assign(actual, input)
            return actual
        })
        return ok(plataforma, "Plataforma actualizada")
    },
    productos: async () => {
        const base = db()
        adminSesion(base)
        return ok(base.productos.map((item) => productoCompleto(base, item)))
    },
    crearProducto: async (input) => {
        const producto = transaccion((base) => {
            adminSesion(base)
            plataformaDe(base, input.plataformaId)
            const nuevo = { ...input, id: siguienteId(base.productos) }
            base.productos.push(nuevo)
            return productoCompleto(base, nuevo)
        })
        return ok(producto, "Producto creado")
    },
    actualizarProducto: async (id, input) => {
        const producto = transaccion((base) => {
            adminSesion(base)
            const actual = productoPorId(base, id)
            Object.assign(actual, input)
            return productoCompleto(base, actual)
        })
        return ok(producto, "Producto actualizado")
    },
    compras: async (filtro = {}) => {
        const base = db()
        adminSesion(base)
        const compras = base.compras
            .filter((item) => !filtro.estado || item.estado === filtro.estado)
            .filter((item) => !filtro.desde || item.createdAt.slice(0, 10) >= filtro.desde)
            .filter((item) => !filtro.hasta || item.createdAt.slice(0, 10) <= filtro.hasta)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((item) => compraCompleta(base, item))
        return ok(compras)
    },
    resumen: async () => {
        const base = db()
        adminSesion(base)
        const hoy = new Date()
        const pagadas = base.compras.filter((item) => item.estado === "pagada" && item.pagadaAt)
        const deHoy = pagadas.filter((item) => mismoDia(new Date(item.pagadaAt ?? ""), hoy))
        const delMes = pagadas.filter((item) => mismoMes(new Date(item.pagadaAt ?? ""), hoy))
        const stock: StockPlataforma[] = base.plataformas.map((plataforma) => {
            const productos = base.productos.filter((item) => item.plataformaId === plataforma.id)
            const cuenta = productos.find((item) => item.tipo === "cuenta")
            const pantalla = productos.find((item) => item.tipo === "pantalla")
            return {
                plataforma,
                stockCuentas: cuenta ? stockDe(base, cuenta) : 0,
                stockPantallas: pantalla ? stockDe(base, pantalla) : 0
            }
        })
        return ok({
            ventasHoy: deHoy.reduce((total, item) => total + item.total, 0),
            ventasMes: delMes.reduce((total, item) => total + item.total, 0),
            comprasHoy: deHoy.length,
            comprasMes: delMes.length,
            clientes: base.usuarios.filter((item) => item.rol === "cliente").length,
            stock
        })
    },
    usuarios: async (filtro = {}) => {
        const base = db()
        adminSesion(base)
        const texto = filtro.busqueda?.trim().toLowerCase() ?? ""
        const usuarios = base.usuarios
            .filter((item) => !filtro.rol || item.rol === filtro.rol)
            .filter((item) => filtro.activo === undefined || item.activo === filtro.activo)
            .filter((item) => !texto || item.nombre.toLowerCase().includes(texto) || item.email.includes(texto))
            .map(sinPassword)
        return ok(usuarios)
    },
    crearUsuario: async (input) => {
        const usuario = transaccion((base) => {
            adminSesion(base)
            const email = input.email.trim().toLowerCase()
            if (base.usuarios.some((item) => item.email === email)) fallo("Ya existe un usuario con ese correo", 409)
            const nuevo = {
                id: siguienteId(base.usuarios),
                nombre: input.nombre.trim(),
                email,
                telefono: input.telefono.trim(),
                rol: input.rol,
                activo: true,
                createdAt: new Date().toISOString(),
                password: input.password
            }
            base.usuarios.push(nuevo)
            return sinPassword(nuevo)
        })
        return ok(usuario, "Usuario creado")
    },
    cambiarEstadoUsuario: async (id, activo) => {
        const usuario = transaccion((base) => {
            const admin = adminSesion(base)
            if (admin.id === id) fallo("No puedes desactivar tu propio usuario")
            const actual = base.usuarios.find((item) => item.id === id)
            if (!actual) fallo("Usuario no encontrado", 404)
            actual.activo = activo
            return sinPassword(actual)
        })
        return ok(usuario, activo ? "Usuario activado" : "Usuario desactivado")
    },
    ejecutarCron: async () => {
        const resultado = transaccion((base) => {
            adminSesion(base)
            let enviados = 0
            let vencidos = 0
            base.servicios.filter((item) => item.estado === "activo").forEach((servicio) => {
                const dias = diasRestantes(servicio.fechaVencimiento)
                const tipo = dias <= 0 ? "vencido" : dias === 1 ? "1_dia" : dias <= 3 ? "3_dias" : null
                if (tipo && !base.notificaciones.some((item) => item.servicioId === servicio.id && item.tipo === tipo)) {
                    base.notificaciones.push({ id: siguienteId(base.notificaciones), servicioId: servicio.id, tipo, enviadaAt: new Date().toISOString() })
                    enviados += 1
                }
                if (dias < 0) {
                    servicio.estado = "vencido"
                    vencidos += 1
                }
            })
            return { enviados, vencidos }
        })
        return ok(resultado, `Revisión completada: ${resultado.enviados} correos enviados`)
    }
}
