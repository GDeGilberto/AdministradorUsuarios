export interface LoginRequest {
  email: string;
  contraseña: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  nombreUsuario: string;
  token: string;
}

export interface User {
  id: number;
  email: string;
  nombreUsuario: string;
}