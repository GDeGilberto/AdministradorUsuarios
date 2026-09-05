export interface LoginRequest {
  email: string;
  contraseña: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  nombreUsuario: string;
}

export interface User {
  id: number;
  email: string;
  nombreUsuario: string;
}
