export interface FormularioDAAC {
    objetivo: string;
    alcance: string;
    responsable?: JSON;
    proveedores?: JSON;
    insumos?: JSON;
    resultados?: JSON;
    recibe?: JSON;
    requisitos?: JSON;
    documentos?: JSON;
    registros?: JSON;
    indicador: string;
    formula: string;
    frecuencia: string;
    documento_soporte_id: number;
}