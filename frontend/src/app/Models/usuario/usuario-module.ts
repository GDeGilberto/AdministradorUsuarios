export enum SexoEnum {
  Masculino = 0,
  Femenino = 1,
}

export interface AddUsuarioRequest {
  email: string;
  nombreUsuario: string;
  contraseña: string;
  confirmarContraseña: string;
  sexo: SexoEnum;
}

export interface UsuarioResponse {
  id: number;
  email: string;
  nombreUsuario: string;
  estatus: boolean;
  sexo: SexoEnum;
  fechaDeCreacion: string;
}