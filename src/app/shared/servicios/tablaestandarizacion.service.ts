import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TablaestandarizacionService {
  encabezados = ['Id', 'estado', 'unificación de criterios', 'Documento de soporte', 'Soporte computacional', 'reglamentación'];

   filas = [
      { col1: 'Unificación de criterios ', col2: 'Procedimiento que se realiza de forma unificada por los roles responsables' },
      { col1: 'soporte documental', col2: 'Procedimiento con documentación de soporte (acuerdos, resoluciones,actas, manuales, formatos, plantillas)' },
      { col1: 'Soporte computacional', col2: 'Procedimiento que se realiza de forma unificada por los roles responsables.' },
      { col1: 'Reglamentacion ', col2: 'Procedimiento reglamentado de acuerdo con los lineamientos de la Universidad, documentado y si lo requiere con soporte computacional.' },
    ]; 

    fichaTecnica = [
      {col1: "PROCEDIMIENTO",col2:""},
      {col1: "CATEGORIA",col2:""},
      {col1: "ROL",col2:""},
      {col1: "ESTADO",col2:""},
      {col1: "ACTIVIDADES",col2:""},
      {col1: "REFERENTES",col2:""},
    ]
    
    tablaclasificacion = [
      { col1: 'i', col2: 'inicial',  col3: ' ', col4: ' ', col5: ' ', col6: ' ' },
      { col1: 'i1', col2: 'intermedio 1', col3: ' x ', col4: ' x ', col5: '', col6: '' },
      { col1: 'i2', col2: 'intermedio 2', col3: ' x ', col4: ' ', col5: ' x ', col6: ' ' },
      { col1: 'i3', col2: 'intermedio 3', col3: ' ', col4: 'x ', col5: ' ', col6: ' x' },
      { col1: 'c', col2: 'completo', col3: ' x ', col4: ' x ', col5: 'x', col6: ' x' },
    ];
}
