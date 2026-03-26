export interface SoporteComputacional {
    id?: number;
    tiene_soporte: boolean | null;
    nombre?: string | null;
    descripcion?: string | null;
    requiere_soporte?: boolean | null;
    computacional_completado: boolean;
}