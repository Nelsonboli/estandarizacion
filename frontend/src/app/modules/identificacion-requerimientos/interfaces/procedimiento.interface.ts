export interface Procedimiento {
  id?: number;
  procedimiento: string;
  categoria: string;
  roles?: JSON;
  estado: string;
  actividades?: JSON;
  referencias?: JSON;
}
