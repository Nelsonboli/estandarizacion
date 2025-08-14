import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TablaestandarizacionService {

  /* Datos de la tabla Criterios */
  encabezadoCriterios = ['Criterios','Descripcion'];
  tablaCriterios = [
    { Criterio: 'Unificación de criterios ', Descripcion: 'Procedimiento que se realiza de forma unificada por los roles responsables' },
    { Criterio: 'soporte documental', Descripcion: 'Procedimiento con documentación de soporte (acuerdos, resoluciones,actas, manuales, formatos, plantillas)' },
    { Criterio: 'Soporte computacional', Descripcion: 'Procedimiento que se realiza de forma unificada por los roles responsables.' },
    { Criterio: 'Reglamentacion ', Descripcion: 'Procedimiento reglamentado de acuerdo con los lineamientos de la Universidad, documentado y si lo requiere con soporte computacional.' },
  ];

  /* Datos de la ficha tecnica */
  encabezadoFichaTecnica = ['FICHA TÉCNICA DE PROCEDIMIENTO'];

tablaFichaTecnica = [
  { Criterio: 'PROCEDIMIENTO', Descripcion: '', Tooltip: 'En este campo se debe identificar el procedimiento a estandarizar, es necesario hacer un análisis de la situación actual del procedimiento, dentro de la Dependencia.' },
  { Criterio: 'CATEGORIA', Descripcion: '', Tooltip: 'De acuerdo con el mapa de procesos de la Universidad de Nariño, los procedimientos propios de la Facultad de Ingeniería pertenecen a la categoría de procesos misionales – Formación Académica' },
  { Criterio: 'ROL', Descripcion: '', Tooltip: 'Funcionarios que participan en el desarrollo del procedimientoSituación actual del procedimiento dentro de la Facultad. Se pueden presentar diferentes estados de acuerdo con las siguientes descripciones' },
  { Criterio: 'ESTADO', Descripcion: '', Tooltip: ' Situación actual del procedimiento dentro de la dependencia. Se pueden presentar diferentes estados para su mayor entendimiento puede ver la tabla 2' },
  { Criterio: 'ACTIVIDADES', Descripcion: '', Tooltip: 'Conjunto de acciones que se realizan para desarrollar el procedimiento, estas acciones siempre deben iniciar con un verbo en infinitivo y no nesesariamente deben tener una secuencia.' },
  { Criterio: 'REFERENTES', Descripcion: '', Tooltip: 'En esta columna se puede ubicar el consecutivo de algún procedimiento definido por la Universidad, en caso de que exista, pueden presentarse dos situaciones: i. Que sea un procedimiento similar, que puede servir de guía para la estandarización del procedimiento. ii. Que sea un procedimiento ques hace parte de alguna actividad del procedimiento a estandarizar. También se puede registrar, notas,comentarios u observaciones relevantes.' },
];

  /* Datos de la tabla Clasificacion */
  encabezadosClasificacion = ['Id', 'estado', 'unificación de criterios', 'Documento de soporte', 'Soporte computacional', 'reglamentación'];

  tablaClasificacion = [
    { col1: 'i', col2: 'inicial', col3: ' ', col4: ' ', col5: ' ', col6: ' ' },
    { col1: 'i1', col2: 'intermedio 1', col3: ' x ', col4: ' x ', col5: '', col6: '' },
    { col1: 'i2', col2: 'intermedio 2', col3: ' x ', col4: ' ', col5: ' x ', col6: ' ' },
    { col1: 'i3', col2: 'intermedio 3', col3: ' ', col4: 'x ', col5: ' ', col6: ' x' },
    { col1: 'c', col2: 'completo', col3: ' x ', col4: ' x ', col5: 'x', col6: ' x' },
  ];
}
