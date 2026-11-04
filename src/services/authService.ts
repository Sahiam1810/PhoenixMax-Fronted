import type { ApiResponse, LoginInput, RegisterInput, Usuario } from "../types"
import { request } from "./http"

export interface AuthResult {
    usuario: Usuario
    token: string
}
export const authService = {
    register: (input: RegisterInput): Promise<ApiResponse<AuthResult>> => request("/auth/register", { method: "POST", body: JSON.stringify(input) }),
    login: (input: LoginInput): Promise<ApiResponse<AuthResult>> => request("/auth/login", { method: "POST", body: JSON.stringify(input) }),
    me: (): Promise<ApiResponse<Usuario>> => request("/auth/me")
}
