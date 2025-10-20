import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatosTablaService {

  /* Datos de la tabla Criterios */
  encabezadoCriterios = ['Criterios', 'Descripcion'];
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
    { key: 'Objetivo', label: 'Objetivo', Tooltip: 'Establece el propósito que tiene el Procedimiento.' },
    { key: 'Alcance', label: 'Alcance', Tooltip: ' Hace referencia al cubrimiento de las actividades del Procedimiento' },
    { key: 'Responsable', label: 'Responsable', Tooltip: ' Determina al (los) funcionario(s) que es (son) responsable(s) de la implementación de las actividades que conforman el Procedimiento' },
    { key: 'Proveedores', label: 'Proveedores', Tooltip: 'Son las personas o entidades que proporcionan las entradas para el Procedimiento. ' },
    { key: 'Insumos', label: 'Insumos', Tooltip: 'Elementos requeridos para el desarrollo del Procedimiento' },
    { key: 'Resultados', label: 'Resultados', Tooltip: ' Producto o servicio que se obtiene del desarrollo del Procedimiento' },
    { key: 'Quien recibe el resultado', label: 'Quien recibe', Tooltip: 'Persona o grupo de personas a quienes va dirigida la implementación del Procedimiento' },
    { key: 'Requisitos legales', label: 'Requisitos legales', Tooltip: 'Hace referencia a las Normas o Actos Administrativos que indican la necesidad u obligatoriedad del Procedimiento o sus actividades' },
    { key: 'Documentos', label: 'Documentos a realizar', Tooltip: 'Información que está evidenciada por medio de un soporte magnético o impreso, estos documentos pueden ser internos o externos a la Universidad ' },
    { key: 'Registros', label: 'Registros a realizar', Tooltip: ' Documentos que presentan resultados obtenidos o proporcionan evidencias de actividades desarrolladas.  Los Registros se originan por el diligenciamiento de Formatos' },
    { key: 'Indicador', label: 'Indicador', Tooltip: ' Magnitud utilizada para medir o comparar los resultados efectivamente obtenidos, en la ejecución de un proyecto, programa o actividad. Resultado cuantitativo de comparar dos variables' },
    { key: 'Fórmula', label: 'Fórmula', Tooltip: ' Modelo establecido para expresar, realizar o resolver algo; en este caso, se refiere al Indicador' },
  ];


    columnas = [
    { Criterio: 'Objetivo', Descripcion: 'Objetivo', Tooltip: 'Establece el propósito que tiene el Procedimiento.' },
    { Criterio: 'Alcance', Descripcion: 'Alcance', Tooltip: ' Hace referencia al cubrimiento de las actividades del Procedimiento' },
    { Criterio: 'Responsable', Descripcion: 'Responsable', Tooltip: ' Determina al (los) funcionario(s) que es (son) responsable(s) de la implementación de las actividades que conforman el Procedimiento' },
    { Criterio: 'Proveedores', Descripcion: 'Proveedores', Tooltip: 'Son las personas o entidades que proporcionan las entradas para el Procedimiento. ' },
    { Criterio: 'Insumos', Descripcion: 'Insumos', Tooltip: 'Elementos requeridos para el desarrollo del Procedimiento' },
    { Criterio: 'Resultados', Descripcion: 'Resultados', Tooltip: ' Producto o servicio que se obtiene del desarrollo del Procedimiento' },
    { Criterio: 'Quien recibe el resultado', Descripcion: 'Quien recibe', Tooltip: 'Persona o grupo de personas a quienes va dirigida la implementación del Procedimiento' },
    { Criterio: 'Requisitos legales', Descripcion: 'Requisitos legales', Tooltip: 'Hace referencia a las Normas o Actos Administrativos que indican la necesidad u obligatoriedad del Procedimiento o sus actividades' },
    { Criterio: 'Documentos', Descripcion: 'Documentos a realizar', Tooltip: 'Información que está evidenciada por medio de un soporte magnético o impreso, estos documentos pueden ser internos o externos a la Universidad ' },
    { Criterio: 'Registros', Descripcion: 'Registros a realizar', Tooltip: ' Documentos que presentan resultados obtenidos o proporcionan evidencias de actividades desarrolladas.  Los Registros se originan por el diligenciamiento de Formatos' },
    { Criterio: 'Indicador', Descripcion: 'Indicador', Tooltip: ' Magnitud utilizada para medir o comparar los resultados efectivamente obtenidos, en la ejecución de un proyecto, programa o actividad. Resultado cuantitativo de comparar dos variables' },
    { Criterio: 'Fórmula', Descripcion: 'Fórmula', Tooltip: ' Modelo establecido para expresar, realizar o resolver algo; en este caso, se refiere al Indicador' },
    { Criterio: 'Frecuencia', Descripcion: 'Frecuencia', Tooltip: 'Periodo durante el cual se aplicará la Fórmula del Indicador.' },
  ];

   columnaDocumento = [
    { key: 'Documento', label: 'Documento' }
  ];

}


