import { useState } from "react"
import { EncabezadoAdmin, Indicador, Tabla, Td, Th } from "../../components/admin"
import { GraficasVentas } from "../../components/admin/GraficasVentas"
import { Aviso, Boton, Cargando } from "../../components/ui"
import { useCarga } from "../../hooks/useCarga"
import { etiquetaCategoria, precio } from "../../lib/formato"
import { adminService } from "../../services/adminService"
import { mensajeError } from "../../services/http"

const cargarResumen = () => adminService.resumen()
const cargarCompras = () => adminService.compras()

function CeldaStock({ valor }: { valor: number }) {
    if (valor === 0) return <span className="font-semibold text-red-600 dark:text-red-400">Agotado</span>
    return <span className={valor <= 2 ? "font-semibold text-amber-700 dark:text-amber-400" : ""}>{valor}</span>
}

export function Resumen() {
    const { data, cargando, error } = useCarga(cargarResumen)
    const compras = useCarga(cargarCompras)
    const [ejecutando, setEjecutando] = useState(false)
    const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error", texto: string } | null>(null)

    const ejecutarCron = async () => {
        setEjecutando(true)
        setMensaje(null)
        try {
            const respuesta = await adminService.ejecutarCron()
            const { enviados, vencidos, errores } = respuesta.data
            const detalle = `Correos enviados: ${enviados}. Servicios marcados como vencidos: ${vencidos}.`
            const fallidos = errores > 0 ? ` ${errores} correos no se pudieron enviar, revisa la configuración de correo del servidor.` : ""
            setMensaje({ tipo: errores > 0 ? "error" : "exito", texto: `${respuesta.message}. ${detalle}${fallidos}` })
        } catch (fallo) {
            setMensaje({ tipo: "error", texto: mensajeError(fallo) })
        } finally {
            setEjecutando(false)
        }
    }

    return (
        <div>
            <EncabezadoAdmin
                titulo="Resumen"
                descripcion="Ventas y stock disponible por plataforma"
                acciones={<Boton variante="secundario" cargando={ejecutando} onClick={ejecutarCron}>Revisar vencimientos ahora</Boton>}
            />
            {mensaje && <div className="mb-4"><Aviso tipo={mensaje.tipo}>{mensaje.texto}</Aviso></div>}
            {cargando && <Cargando />}
            {error && <Aviso tipo="error">{error}</Aviso>}
            {data && (
                <div className="space-y-8">
                    {/* Indicadores Clave */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <Indicador etiqueta="Ventas hoy" valor={precio(data.ventasHoy)} detalle={`${data.comprasHoy} compras`} />
                        <Indicador etiqueta="Ventas del mes" valor={precio(data.ventasMes)} detalle={`${data.comprasMes} compras`} />
                        <Indicador etiqueta="Ticket promedio" valor={precio(data.comprasMes ? Math.round(data.ventasMes / data.comprasMes) : 0)} detalle="Este mes" />
                        <Indicador etiqueta="Clientes" valor={String(data.clientes)} detalle="Registrados" />
                    </div>

                    {/* Gráficas de Ventas */}
                    <GraficasVentas compras={compras.data ?? []} resumen={data} />

                    {/* Tabla de Stock */}
                    <div>
                        <h2 className="mb-3 text-base font-bold text-ink dark:text-white sm:text-lg">
                            Stock por plataforma
                        </h2>
                        <Tabla>
                            <thead>
                                <tr>
                                    <Th>Plataforma</Th>
                                    <Th>Categoría</Th>
                                    <Th className="text-right">Pantallas por cuenta</Th>
                                    <Th className="text-right">Cuentas completas</Th>
                                    <Th className="text-right">Pantallas</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.stock.map((fila) => (
                                    <tr key={fila.plataforma.id}>
                                        <Td className="font-medium text-ink dark:text-white">{fila.plataforma.nombre}{!fila.plataforma.activo && <span className="ml-2 text-xs text-slate-500 dark:text-neutral-400">(inactiva)</span>}</Td>
                                        <Td>{etiquetaCategoria[fila.plataforma.categoria]}</Td>
                                        <Td className="text-right">{fila.plataforma.maxPantallas}</Td>
                                        <Td className="text-right"><CeldaStock valor={fila.stockCuentas} /></Td>
                                        <Td className="text-right"><CeldaStock valor={fila.stockPantallas} /></Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Tabla>
                    </div>
                </div>
            )}
        </div>
    )
}
