import { Injectable } from '@angular/core';
import { estado } from '../interfaces/estado.interfaces';
import { FichaTecnica } from '../interfaces/ficha-tecnica.interface';
import { Campos } from '../interfaces/campos.interface';
import { Criterios, Clasificacion } from '../interfaces/tablas.interface';
import { DocumentoReferencia } from '../interfaces/enlaces.interface';

@Injectable({
  providedIn: 'root'
})
export class DatosService {

  /* Datos de la referencias para modulo recoleccioninformacion */
  public readonly documentos: DocumentoReferencia[] = [
    { titulo: 'Estatuto General', url: 'https://electronica.udenar.edu.co/wp-content/uploads/2020/10/Estatuto-General.pdf' },
    { titulo: 'Proyecto Educativo Institucional', url: 'https://secretariageneral.udenar.edu.co/wp-content/uploads/2011/09/Proyecto-educativo-institucional-2009.pdf' },
    { titulo: 'Estatuto de Posgrados', url: 'https://www.udenar.edu.co/recursos/wp-content/uploads/2017/08/Estatutoposgrados.pdf' },
    { titulo: 'Plan de Desarrollo Institucional', url: 'https://www.udenar.edu.co/documentos/PDI-UDENAR-2020.pdf' },
    { titulo: 'Estatuto Estudiantil', url: 'https://www.udenar.edu.co/recursos/wp-content/uploads/2017/11/estatuto-estudiantil-udenar.pdf' },
    { titulo: 'Estatuto Personal Docente', url: 'https://secretariageneral.udenar.edu.co/wp-content/uploads/2024/05/ESTATUTO-DE-PERSONAL-DOCENTE-a-febrero-2024.pdf' }
  ];


  /* Datos de la tabla Criterios */
  public readonly encabezadoCriterios = ['Criterios', 'Descripción'];
  public readonly tablaCriterios: Criterios[] = [
    { Criterio: 'Unificación de criterios', Descripcion: 'Procedimiento que se realiza de forma unificada por los roles responsables' },
    { Criterio: 'Soporte documental', Descripcion: 'Procedimiento con documentación de soporte (acuerdos, resoluciones, actas, manuales, formatos, plantillas)' },
    { Criterio: 'Soporte computacional', Descripcion: 'Procedimiento que se realiza de forma unificada por los roles responsables.' },
    { Criterio: 'Reglamentación', Descripcion: 'Procedimiento reglamentado de acuerdo con los lineamientos de la Universidad, documentado y, si lo requiere, con soporte computacional.' },
  ];

  /* Datos de la tabla Clasificacion */
  public readonly encabezadosClasificacion = ['Id', 'Estado', 'Unificación de criterios', 'Documento de soporte', 'Soporte computacional', 'Reglamentación'];
  public readonly tablaClasificacion: Clasificacion[] = [
    { col1: 'i', col2: 'inicial', col3: ' ', col4: ' ', col5: ' ', col6: ' ' },
    { col1: 'i1', col2: 'intermedio 1', col3: ' x ', col4: ' x ', col5: '', col6: '' },
    { col1: 'i2', col2: 'intermedio 2', col3: ' x ', col4: ' ', col5: ' x ', col6: ' ' },
    { col1: 'i3', col2: 'intermedio 3', col3: ' ', col4: 'x ', col5: ' ', col6: ' x' },
    { col1: 'C', col2: 'completo', col3: ' x ', col4: ' x ', col5: 'x', col6: ' x' },
  ];

  //Datos Formulario DAAC
  public readonly DescripcionDAAC = ["Formulario División de Autoevaluación y Acreditación de la Calidad"];
  public readonly columnasDAAC: Campos[] = [
    { key: 'objetivo', label: 'Objetivo', Tooltip: 'Establece el propósito que tiene el Procedimiento.', required: true, soloTexto: true },
    { key: 'alcance', label: 'Alcance', Tooltip: 'Hace referencia al cubrimiento de las actividades del Procedimiento.', required: true, soloTexto: true },
    { key: 'responsable', label: 'Responsable', Tooltip: 'Determina quién es responsable de las actividades.', required: true, soloTexto: true },
    { key: 'proveedores', label: 'Proveedores', Tooltip: 'Personas o entidades que proporcionan entradas para el procedimiento.', required: true, soloTexto: true },
    { key: 'insumos', label: 'Insumos', Tooltip: 'Elementos requeridos para el desarrollo del procedimiento.', required: true, soloTexto: true },
    { key: 'resultados', label: 'Resultados', Tooltip: 'Producto o servicio obtenido del procedimiento.', required: true, soloTexto: true },
    { key: 'recibe', label: 'Quién recibe', Tooltip: 'Persona o grupo que recibe el resultado.', required: true, soloTexto: true },
    { key: 'requisitos', label: 'Requisitos', Tooltip: 'Normas o actos administrativos que lo sustentan.', required: true, soloTexto: true },
    { key: 'documentos', label: 'Documentos a realizar', Tooltip: 'Documentos de soporte del procedimiento.', required: true, soloTexto: true },
    { key: 'registros', label: 'Registros a realizar', Tooltip: 'Registros o evidencias generadas.', required: true, soloTexto: true },
    { key: 'indicador', label: 'Indicador', Tooltip: 'Magnitud para medir resultados.', required: true, soloTexto: true },
    { key: 'formula', label: 'Fórmula', Tooltip: 'Modelo usado para calcular el indicador.', required: true, soloTexto: true },
    { key: 'frecuencia', label: 'Frecuencia', Tooltip: 'Periodo de aplicación del indicador.', required: true, soloTexto: true },
  ];

  // --- Genera automáticamente las columnas del backend
  public readonly columnaDocumento: Campos[] = [
    { key: 'documento', label: 'documento' }
  ];
  /* Datos de la ficha tecnica */
  //Datos para el Formulario Ficha Técnica de procedimiento
  public readonly camposFormularioFTP: Campos[] = [
    {
      key: 'procedimiento',
      label: 'Procedimiento',
      Tooltip: 'Defina el procedimiento que desea estandarizar.',
      required: true,
      soloTexto: true,
    },
    {
      key: 'categoria',
      label: 'categoría',
      Tooltip: 'Seleccione la categoría a la cual pertenece el procedimiento.',
      required: true,
      type: 'select' as const,
      options: [
        { label: 'Procesos Estratégicos - Direccionamiento Estratégico', value: 'Procesos Estratégicos - Direccionamiento Estratégico' },
        { label: 'Procesos Estratégicos - Gestión de Calidad', value: 'Procesos Estratégicos - Gestión de Calidad' },
        { label: 'Procesos Misionales - Formación Academica', value: 'Procesos Misionales - Formación Academica' },
        { label: 'Procesos Misionales - Investigación', value: 'Procesos Misionales - Investigación' },
        { label: 'Procesos Misionales - Interacción Social', value: 'Procesos Misionales - Interacción Social' },
        { label: 'Procesos de Apoyo - Gestión de Información y Tecnología', value: 'Procesos de Apoyo - Gestión de Información y Tecnología' },
        { label: 'Procesos de Apoyo - Gestión de Recursos físicos', value: 'Procesos de Apoyo - Gestión de Recursos físicos' },
        { label: 'Procesos de Apoyo - Gestión Jurídica', value: 'Procesos de Apoyo - Gestión Jurídica' },
        { label: 'Procesos de Apoyo - Soporte a Procesos Misionales', value: 'Procesos de Apoyo - Soporte a Procesos Misionales' },
        { label: 'Procesos de Apoyo - Gestión de Bienestar Universitario', value: 'Procesos de Apoyo - Gestión de Bienestar Universitario' },
        { label: 'Procesos de Apoyo - Gestión Financiera', value: 'Procesos de Apoyo - Gestión Financiera' },
        { label: 'Procesos de Apoyo - Gestión de Comunicaciones', value: 'Procesos de Apoyo - Gestión de Comunicaciones' },
        { label: 'Procesos de Apoyo - Gestión Documental', value: 'Procesos de Apoyo - Gestión Documental' },
        { label: 'Procesos de Apoyo - Gestión Humana', value: 'Procesos de Apoyo - Gestión Humana' },
      ]
    },
    {
      key: 'roles',
      label: 'Roles',
      Tooltip: 'Indique el rol o roles responsables de este procedimiento.',
      required: true,
      soloTexto: true,
    },
    {
      key: 'estado',
      label: 'Estado',
      Tooltip: 'Especifique el estado actual del procedimiento (Inicial, Intermedio 1, Intermedio 2, Intermedio 3).',
      required: true,
      type: 'select' as const,
      options: [
        { label: 'Inicial (I)', value: 'Inicial' },
        { label: 'Intermedio 1 (I1)', value: 'Intermedio 1' },
        { label: 'Intermedio 2 (I2)', value: 'Intermedio 2' },
        { label: 'Intermedio 3 (I3)', value: 'Intermedio 3' },
        { label: 'Completo (C)', value: 'Completo' }
      ]
    },
    {
      key: 'actividades',
      label: 'Actividades',
      Tooltip: 'Liste las actividades que componen el procedimiento, en orden secuencial.',
      required: true,
      soloTexto: true,
    },
    {
      key: 'referencias',
      label: 'Referencias',
      Tooltip: 'Agregue los documentos o normativas que sirvan de referencia para este procedimiento.',
      required: true,
      soloTexto: true,
    },
  ];

  // Datos de la tabla de la Ficha Tecnica de Procedimiento  
  columnasFormularioFTP: Campos[] = [
    { key: 'procedimiento', label: 'Procedimiento', },
    { key: 'categoria', label: 'Categoría', },
    { key: 'roles', label: 'Roles', },
    { key: 'estado', label: 'Estado', },
    { key: 'actividades', label: 'Actividades', },
    { key: 'referencias', label: 'Referencias', },
  ];

  public readonly encabezadoFichaTecnica = ['Ficha técnica de procedimiento'];

  public readonly estados = [
    "Documento de Soporte",
    "Soporte Computacional",
    "Reglamento"
  ];

  tablaFichaTecnica: FichaTecnica[] = [
    { Criterio: 'PROCEDIMIENTO', Descripcion: '', Tooltip: 'En este campo se debe identificar el procedimiento a estandarizar, es necesario hacer un análisis de la situación actual del procedimiento, dentro de la Dependencia.' },
    { Criterio: 'CATEGORÍA', Descripcion: '', Tooltip: 'De acuerdo con el mapa de procesos de la Universidad de Nariño, los procedimientos propios de la Facultad de Ingeniería pertenecen a la categoría de procesos misionales – Formación Académica' },
    { Criterio: 'ROL', Descripcion: '', Tooltip: 'Funcionarios que participan en el desarrollo del procedimiento. Situación actual del procedimiento dentro de la Facultad. Se pueden presentar diferentes estados de acuerdo con las siguientes descripciones' },
    { Criterio: 'ESTADO', Descripcion: '', Tooltip: 'Situación actual del procedimiento dentro de la dependencia. Se pueden presentar diferentes estados para su mayor entendimiento; puede ver la tabla 2' },
    { Criterio: 'ACTIVIDADES', Descripcion: '', Tooltip: 'Conjunto de acciones que se realizan para desarrollar el procedimiento, estas acciones siempre deben iniciar con un verbo en infinitivo y no necesariamente deben tener una secuencia.' },
    { Criterio: 'REFERENTES', Descripcion: '', Tooltip: 'En esta columna se puede ubicar el consecutivo de algún procedimiento definido por la Universidad, en caso de que exista, pueden presentarse dos situaciones: i. Que sea un procedimiento similar, que puede servir de guía para la estandarización del procedimiento. ii. Que sea un procedimiento que hace parte de alguna actividad del procedimiento a estandarizar. También se puede registrar, notas, comentarios u observaciones relevantes.' },
  ];

  public readonly Estado_actual_procedimiento: estado[] = [
    {
      estado: 'Inicial ',
      descripcion: 'Teniendo en cuenta que este procedimiento se encuentra en un estado inicial, se ha identificado que para llegar'
        + ' al estado completo se requiere definir y establecer los soportes documentales, soporte computacional y reglamentar el procedimiento.'
    },
    {
      estado: 'Intermedio 1',
      descripcion: 'El procedimiento se encuentra en un estado intermedio I1, para llegar a un estado completo '
        + 'se requiere definir el soporte computacional y reglamentar el procedimiento'
    },
    {
      estado: 'Intermedio 2',
      descripcion: 'El procedimiento se encuentra en un estado intermedio I2, para llegar a un estado'
        + 'completo se requiere definir y establecer los soportes documentales y la reglamentación del procedimiento.'
    },
    {
      estado: 'Intermedio 3',
      descripcion: 'El procedimiento se encuentra en un estado intermedio I3, para llegar a un estado completo '
        + 'se requiere definir y establecer la unificación de criterios y definir si se requiere o no un soporte computacional.'
    },
    {
      estado: 'Completo',
      descripcion: 'El procedimiento se encuentra en un estado completo,'
    },
  ];

  // Opciones para el componente card
  public readonly opciones = [
    ["Reglamento base", "Formulario de procedimiento DAAC", "Diagrama de procedimiento"],
    ["Soporte computacional"],
    ["Ficha de procedimiento descargada", "Ficha de procedimiento aprobada por la DAAC", "Formato de estandarización descargado", "Formato de estandarización subido"]

  ];

  // "Formato de estanrdarización descargado", "formato de estandarización aprobado por la dependencia"
  public readonly encabezadoReglamentoBase = ['Reglamento base'];
  public readonly columnaReglamentoBase: Campos[] = [
    { key: 'documento', label: 'documento' }
  ];

}



