export interface ActividadesDocumentoSoporte {
    reglamentoBase: boolean;
    formulario: boolean;
    diagramaFlujo: boolean;
}

export interface DocumentoSoporte {
    id: number;
    id_procedimiento: number;
    documento_completado: boolean;
    actividades_completadas?: ActividadesDocumentoSoporte;
    procedimiento?: {
        procedimiento: string;
    };
    diagramaFlujo?: DiagramaFlujo;
}

export interface DiagramaFlujo {
    id_diagrama?: number;
    documento_diagrama: string;
    ubicacion_diagrama?: string;
    json_diagrama?: any;
}

export interface ReglamentoBase {
    id?: number;
    documento: string | boolean;
}

export interface FormularioDAAC {
    id?: number;
    objetivo: string;
    alcance: string;
    responsable?: string[] | string;
    proveedores?: string[] | string;
    insumos?: string[] | string;
    resultados?: string[] | string;
    recibe?: string[] | string;
    requisitos?: string[] | string;
    documentos?: string[] | string;
    registros?: string[] | string;
    indicador: string;
    formula: string;
    frecuencia: string;
    documento_soporte_id?: number;
    documentoSoporte?: DocumentoSoporte;
    procedimiento?: {
        procedimiento: string;
    };
}

export interface JsonDiagrama {
    cells: any[];
    paperHeight?: number;
}

