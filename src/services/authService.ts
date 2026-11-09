import type { ApiResponse, AuthResult, LoginInput, PerfilInput, RegisterInput, Usuario } from "../types"
import { aUsuario, type UsuarioDto } from "./api/adaptadores"
import { cuerpo, request } from "./http"

export interface AuthService {
    register: (input: RegisterInput) => Promise<ApiResponse<AuthResult>>
    login: (input: LoginInput) => Promise<ApiResponse<AuthResult>>
    me: () => Promise<ApiResponse<Usuario>>
    actualizarPerfil: (input: PerfilInput) => Promise<ApiResponse<Usuario>>
}

interface LoginDto {
    token: string
    usuario: UsuarioDto
}

const login = async (input: LoginInput): Promise<ApiResponse<AuthResult>> => {
    const respuesta = await request<LoginDto>("/auth/login", { method: "POST", ...cuerpo(input) })
    return { message: respuesta.message, data: { token: respuesta.data.token, usuario: aUsuario(respuesta.data.usuario) } }
}

const authApi: AuthService = {
    register: async (input) => {
        const telefono = input.telefono.trim()
        await request<UsuarioDto>("/auth/register", { method: "POST", ...cuerpo({ nombre: input.nombre, email: input.email, password: input.password, telefono: telefono || undefined }) })
        return login({ email: input.email, password: input.password })
    },
    login,
    me: async () => {
        const respuesta = await request<UsuarioDto>("/auth/me")
        return { message: respuesta.message, data: aUsuario(respuesta.data) }
    },
    actualizarPerfil: async (input) => {
        const respuesta = await request<UsuarioDto>("/auth/me", { method: "PATCH", ...cuerpo(input) })
        return { message: respuesta.message, data: aUsuario(respuesta.data) }
    }
}

export const authService: AuthService = authApi
