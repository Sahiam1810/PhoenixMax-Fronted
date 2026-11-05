import { registrarSemilla } from "./db"
import { semilla } from "./seed"

registrarSemilla(semilla)

export * from "./db"
