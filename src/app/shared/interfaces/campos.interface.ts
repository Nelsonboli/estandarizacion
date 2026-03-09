export interface Campos {
    key: string;
    label: string;
    Tooltip?: string;
    required?: boolean;
    soloTexto?: boolean;
    type?: 'input' | 'select' | 'textarea';
    options?: { label: string; value: any }[];
}