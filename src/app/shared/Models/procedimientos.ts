export interface Procedimiento {
  id: number;      
  procedimiento: string;
  rol?: string[]; // Solo para Identificación
  estado?: string;  // Solo para Identificación
  actividades?: string[];  // Solo para Identificación
  referentes?: string;   // Solo para Identificación
}