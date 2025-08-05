export interface Procedimiento {
  titulo: string;
  aprobado: string;
  version: string;
  resumen: string;
}

export interface Paso {
  titulo: string;
  responsable: string;
  dias: number;
}

export interface Rol {
  nombre: string;
  descripcion: string;
}
