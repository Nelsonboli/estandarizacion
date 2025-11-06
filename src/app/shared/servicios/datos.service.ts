import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatosService {

  /* Datos de la tabla Criterios */
  encabezadoCriterios = ['Criterios', 'Descripcion'];
  tablaCriterios = [
    { Criterio: 'Unificación de criterios ', Descripcion: 'Procedimiento que se realiza de forma unificada por los roles responsables' },
    { Criterio: 'soporte documental', Descripcion: 'Procedimiento con documentación de soporte (acuerdos, resoluciones,actas, manuales, formatos, plantillas)' },
    { Criterio: 'Soporte computacional', Descripcion: 'Procedimiento que se realiza de forma unificada por los roles responsables.' },
    { Criterio: 'Reglamentacion ', Descripcion: 'Procedimiento reglamentado de acuerdo con los lineamientos de la Universidad, documentado y si lo requiere con soporte computacional.' },
  ];

  /* Datos de la tabla Clasificacion */
  encabezadosClasificacion = ['Id', 'estado', 'unificación de criterios', 'Documento de soporte', 'Soporte computacional', 'reglamentación'];

  tablaClasificacion = [
    { col1: 'i', col2: 'inicial', col3: ' ', col4: ' ', col5: ' ', col6: ' ' },
    { col1: 'i1', col2: 'intermedio 1', col3: ' x ', col4: ' x ', col5: '', col6: '' },
    { col1: 'i2', col2: 'intermedio 2', col3: ' x ', col4: ' ', col5: ' x ', col6: ' ' },
    { col1: 'i3', col2: 'intermedio 3', col3: ' ', col4: 'x ', col5: ' ', col6: ' x' },
    { col1: 'C', col2: 'completo', col3: ' x ', col4: ' x ', col5: 'x', col6: ' x' },
  ];

  ProcesoEstandarizado = [
    { col1: 'i', col2: 'inicial', col3: ' ', col4: ' ', col5: ' ', col6: ' ' },
    { col1: 'i1', col2: 'intermedio 1', col3: '  ', col4: '  ', col5: '', col6: '' },
    { col1: 'i2', col2: 'intermedio 2', col3: '  ', col4: ' ', col5: '  ', col6: ' ' },
    { col1: 'i3', col2: 'intermedio 3', col3: ' ', col4: ' ', col5: ' ', col6: ' ' },
    { col1: 'C', col2: 'completo', col3: ' x ', col4: ' x ', col5: 'x', col6: ' x' },
  ]

  //Datos Formulario DAAC
  DescripcionDAAC = ["Formulario División de Autoevaluación y Acreditación de la Calidad"];

  columnasDAAC = [
    { key: 'objetivo', label: 'objetivo', Tooltip: 'Establece el propósito que tiene el Procedimiento.' },
    { key: 'alcance', label: 'alcance', Tooltip: 'Hace referencia al cubrimiento de las actividades del Procedimiento.' },
    { key: 'responsable', label: 'responsable', Tooltip: 'Determina quién es responsable de las actividades.' },
    { key: 'proveedores', label: 'proveedores', Tooltip: 'Personas o entidades que proporcionan entradas para el procedimiento.' },
    { key: 'insumos', label: 'insumos', Tooltip: 'Elementos requeridos para el desarrollo del procedimiento.' },
    { key: 'resultados', label: 'resultados', Tooltip: 'Producto o servicio obtenido del procedimiento.' },
    { key: 'quien recibe', label: 'quien recibe', Tooltip: 'Persona o grupo que recibe el resultado.' },
    { key: 'requisitos', label: 'requisitos', Tooltip: 'Normas o actos administrativos que lo sustentan.' },
    { key: 'documentos', label: 'documentos a realizar', Tooltip: 'Documentos de soporte del procedimiento.' },
    { key: 'registros', label: 'registros a realizar', Tooltip: 'Registros o evidencias generadas.' },
    { key: 'indicador', label: 'indicador', Tooltip: 'Magnitud para medir resultados.' },
    { key: 'formula', label: 'fórmula', Tooltip: 'Modelo usado para calcular el indicador.' },
    { key: 'frecuencia', label: 'frecuencia', Tooltip: 'Periodo de aplicación del indicador.' },
  ];

  // --- Genera automáticamente las columnas del backend
  get columnasformularioDAAC() {
    return this.columnasDAAC.map(col => ({
      key: col.key.toLowerCase().replace(/ /g, '_'), // convierte "Quien recibe el resultado" → "quien_recibe_el_resultado"
      label: col.label
    }));
  }

   columnaDocumento = [
    { key: 'Documento', label: 'Documento' }
  ];

  /* Datos de la ficha tecnica */
  //Datos para el Formulario Ficha Técnica de procedimiento
  camposFormularioFTP = [
    {
      key: 'procedimiento',
      label: 'procedimiento',
      Tooltip: 'Defina el procedimiento que desea estandarizar.',
      required: true
    },
    {
      key: 'categoria',
      label: 'categoría',
      Tooltip: 'Seleccione la categoría a la cual pertenece el procedimiento.',
      required: true
    },
    {
      key: 'roles',
      label: 'roles',
      Tooltip: 'Indique el rol o roles responsables de este procedimiento.',
      required: true
    },
    {
      key: 'estado',
      label: 'estado',
      Tooltip: 'Especifique el estado actual del procedimiento (Inicial, Intermedio 1, Intermedio 2, Intermedio 3).',
      required: true
    },
    {
      key: 'actividades',
      label: 'actividades',
      Tooltip: 'Liste las actividades que componen el procedimiento, en orden secuencial.',
      required: true
    },
    {
      key: 'referencias',
      label: 'referencias',
      Tooltip: 'Agregue los documentos o normativas que sirvan de referencia para este procedimiento.',
      required: true
    },
  ];

  // Datos de la tabla de la Ficha Tecnica de Procedimiento  
  columnasFormularioFTP = [
    { key: 'procedimiento', label: 'procedimiento', },
    { key: 'categoria', label: 'categoría', },
    { key: 'roles', label: 'roles', },
    { key: 'estado', label: 'estado', },
    { key: 'actividades', label: 'actividades', },
    { key: 'referencias', label: 'Referencias', },
  ];

  encabezadoFichaTecnica = ['Ficha técnica de proceimiento'];

  tablaFichaTecnica = [
    { Criterio: 'PROCEDIMIENTO', Descripcion: '', Tooltip: 'En este campo se debe identificar el procedimiento a estandarizar, es necesario hacer un análisis de la situación actual del procedimiento, dentro de la Dependencia.' },
    { Criterio: 'CATEGORIA', Descripcion: '', Tooltip: 'De acuerdo con el mapa de procesos de la Universidad de Nariño, los procedimientos propios de la Facultad de Ingeniería pertenecen a la categoría de procesos misionales – Formación Académica' },
    { Criterio: 'ROL', Descripcion: '', Tooltip: 'Funcionarios que participan en el desarrollo del procedimientoSituación actual del procedimiento dentro de la Facultad. Se pueden presentar diferentes estados de acuerdo con las siguientes descripciones' },
    { Criterio: 'ESTADO', Descripcion: '', Tooltip: ' Situación actual del procedimiento dentro de la dependencia. Se pueden presentar diferentes estados para su mayor entendimiento puede ver la tabla 2' },
    { Criterio: 'ACTIVIDADES', Descripcion: '', Tooltip: 'Conjunto de acciones que se realizan para desarrollar el procedimiento, estas acciones siempre deben iniciar con un verbo en infinitivo y no nesesariamente deben tener una secuencia.' },
    { Criterio: 'REFERENTES', Descripcion: '', Tooltip: 'En esta columna se puede ubicar el consecutivo de algún procedimiento definido por la Universidad, en caso de que exista, pueden presentarse dos situaciones: i. Que sea un procedimiento similar, que puede servir de guía para la estandarización del procedimiento. ii. Que sea un procedimiento ques hace parte de alguna actividad del procedimiento a estandarizar. También se puede registrar, notas,comentarios u observaciones relevantes.' },
  ];

}


