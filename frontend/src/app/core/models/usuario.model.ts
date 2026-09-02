export enum UsuarioEstatus {
  Inactivo = 0,
  Activo = 1
}

export enum UsuarioSexo {
  Masculino = 0,
  Femenino = 1
}

export interface Usuario {
  id: number;
  email: string;
  nombreUsuario: string;
  estatus: UsuarioEstatus;
  sexo: UsuarioSexo;
}

export interface UsuarioTableData extends Usuario {
  estatusText: string;
  sexoText: string;
}
