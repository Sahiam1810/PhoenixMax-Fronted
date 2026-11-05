import type { ApiResponse, AuthResult, LoginInput, PerfilInput, RegisterInput, Usuario } from "../types"
import { authMock } from "../mocks/servicios/authMock"
import { cuerpo, request, usarMocks } from "./http"

export interface AuthService {
    register: (input: RegisterInput) => Promise<ApiResponse<AuthResult>>
    login: (input: LoginInput) => Promise<ApiResponse<AuthResult>>
    me: () => Promise<ApiResponse<Usuario>>
    actualizarPerfil: (input: PerfilInput) => Promise<ApiResponse<Usuario>>
}

const authApi: AuthService = {
    register: (input) => request("/auth/register", { method: "POST", ...cuerpo(input) }),
    login: (input) => request("/auth/login", { method: "POST", ...cuerpo(input) }),
    me: () => request("/auth/me"),
    actualizarPerfil: (input) => request("/auth/me", { method: "PATCH", ...cuerpo(input) })
}

export const authService: AuthService = usarMocks ? authMock : authApi
