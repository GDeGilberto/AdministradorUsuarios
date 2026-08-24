export interface Usuario {
  id: number;
  email: string;
  nombreUsuario: string;
  estatus: number;
  sexo: number;
  fechaDeCreacion: string;
}

export enum UsuarioEstatus {
  Inactivo = 0,
  Activo = 1
}

export enum UsuarioSexo {
  Masculino = 0,
  Femenino = 1
}

export interface UsuarioTableData extends Usuario {
  estatusText: string;
  sexoText: string;
}
