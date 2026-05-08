import { SafeResourceUrl } from "@angular/platform-browser";

export interface Reglamento {
    id?: number;
    reglamento_completado: boolean
    formato_daac_descargado: string
    formato_daac_subido: string
    actividades_completadas: actividadesReglamento
}

export interface actividadesReglamento {
    descarga_daac_completada: boolean
    subida_daac_completada: boolean
}

export interface documentoSubido {
    file: File,
    fileName: string,
    previewUrl: SafeResourceUrl
}