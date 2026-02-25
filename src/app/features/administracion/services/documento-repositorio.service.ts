import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TipoArchivoRepositorio } from 'src/app/shared/enum/tipo-archivo-repositorio.enum';
import { ArchivoDTO, IArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { DocumentoRepositorioDTO } from 'src/app/shared/models/pliego/documento-repositorio.model';
import { FiltroDocumentoRepositorioDTO } from '../models/filtros/filtro-documento-repositorio.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentoRepositorioService {
  private documentos: DocumentoRepositorioDTO[] = [];
  private nextId = 1;

  // Tamaño máximo permitido: 100 KB
  private readonly MAX_FILE_SIZE_KB = 100;
  private readonly MAX_FILE_SIZE_BYTES = this.MAX_FILE_SIZE_KB * 1024;

  // Tipos MIME permitidos
  private readonly TIPOS_PERMITIDOS = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  constructor() {
    this.inicializarDatosMock();
  }

  private inicializarDatosMock(): void {
    const documentosMock: DocumentoRepositorioDTO[] = [
      {
        id: this.nextId++,
        idInciso: 1,
        nombreInciso: 'Inciso 01 - Presidencia',
        idUnidadEjecutora: 1,
        nombreUnidadEjecutora: 'UE 001 - Oficina Central',
        nombreDocumento: 'Logo Institucional Principal',
        descripcionDocumento: 'Logo oficial de la institución en formato vectorial',
        tipoArchivo: TipoArchivoRepositorio.LOGO,
        archivo: new ArchivoDTO(1, 'logo-principal.pdf', 'application/pdf', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-01-15'),
        fechaModificacion: new Date('2024-01-15')
      },
      {
        id: this.nextId++,
        idInciso: 1,
        nombreInciso: 'Inciso 01 - Presidencia',
        idUnidadEjecutora: 1,
        nombreUnidadEjecutora: 'UE 001 - Oficina Central',
        nombreDocumento: 'Formulario de Solicitud de Compras',
        descripcionDocumento: 'Formulario estándar para solicitudes de compra',
        tipoArchivo: TipoArchivoRepositorio.FORMULARIO,
        archivo: new ArchivoDTO(2, 'formulario-compras.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-01-20'),
        fechaModificacion: new Date('2024-02-10')
      },
      {
        id: this.nextId++,
        idInciso: 1,
        nombreInciso: 'Inciso 01 - Presidencia',
        idUnidadEjecutora: 2,
        nombreUnidadEjecutora: 'UE 002 - Recursos Humanos',
        nombreDocumento: 'Plantilla de Evaluación de Desempeño',
        descripcionDocumento: 'Plantilla para evaluar el desempeño del personal',
        tipoArchivo: TipoArchivoRepositorio.FORMULARIO,
        archivo: new ArchivoDTO(3, 'evaluacion-desempeno.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-02-01'),
        fechaModificacion: new Date('2024-02-01')
      },
      {
        id: this.nextId++,
        idInciso: 2,
        nombreInciso: 'Inciso 02 - Ministerio del Interior',
        idUnidadEjecutora: 3,
        nombreUnidadEjecutora: 'UE 003 - Dirección General',
        nombreDocumento: 'Logo Ministerio Interior',
        descripcionDocumento: 'Logo oficial del Ministerio del Interior',
        tipoArchivo: TipoArchivoRepositorio.LOGO,
        archivo: new ArchivoDTO(4, 'logo-ministerio.pdf', 'application/pdf', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-01-10'),
        fechaModificacion: new Date('2024-01-10')
      },
      {
        id: this.nextId++,
        idInciso: 2,
        nombreInciso: 'Inciso 02 - Ministerio del Interior',
        idUnidadEjecutora: 3,
        nombreUnidadEjecutora: 'UE 003 - Dirección General',
        nombreDocumento: 'Manual de Procedimientos Administrativos',
        descripcionDocumento: 'Documento con procedimientos administrativos internos',
        tipoArchivo: TipoArchivoRepositorio.OTRO,
        archivo: new ArchivoDTO(5, 'manual-procedimientos.pdf', 'application/pdf', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-02-05'),
        fechaModificacion: new Date('2024-03-01')
      },
      {
        id: this.nextId++,
        idInciso: 2,
        nombreInciso: 'Inciso 02 - Ministerio del Interior',
        idUnidadEjecutora: 4,
        nombreUnidadEjecutora: 'UE 004 - Logística',
        nombreDocumento: 'Formulario de Inventario',
        descripcionDocumento: 'Formulario para registrar inventario de materiales',
        tipoArchivo: TipoArchivoRepositorio.FORMULARIO,
        archivo: new ArchivoDTO(6, 'formulario-inventario.xls', 'application/vnd.ms-excel', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-01-25'),
        fechaModificacion: new Date('2024-01-25')
      },
      {
        id: this.nextId++,
        idInciso: 3,
        nombreInciso: 'Inciso 03 - Ministerio de Economía',
        idUnidadEjecutora: 5,
        nombreUnidadEjecutora: 'UE 005 - Contabilidad',
        nombreDocumento: 'Plantilla de Presupuesto Anual',
        descripcionDocumento: 'Plantilla Excel para elaborar presupuestos anuales',
        tipoArchivo: TipoArchivoRepositorio.FORMULARIO,
        archivo: new ArchivoDTO(7, 'presupuesto-anual.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-01-05'),
        fechaModificacion: new Date('2024-01-05')
      },
      {
        id: this.nextId++,
        idInciso: 3,
        nombreInciso: 'Inciso 03 - Ministerio de Economía',
        idUnidadEjecutora: 5,
        nombreUnidadEjecutora: 'UE 005 - Contabilidad',
        nombreDocumento: 'Logo Ministerio de Economía',
        descripcionDocumento: 'Logo oficial del ministerio',
        tipoArchivo: TipoArchivoRepositorio.LOGO,
        archivo: new ArchivoDTO(8, 'logo-economia.pdf', 'application/pdf', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-01-12'),
        fechaModificacion: new Date('2024-01-12')
      },
      {
        id: this.nextId++,
        idInciso: 3,
        nombreInciso: 'Inciso 03 - Ministerio de Economía',
        idUnidadEjecutora: 6,
        nombreUnidadEjecutora: 'UE 006 - Tesorería',
        nombreDocumento: 'Instructivo de Pagos',
        descripcionDocumento: 'Documento con instrucciones para procesar pagos',
        tipoArchivo: TipoArchivoRepositorio.OTRO,
        archivo: new ArchivoDTO(9, 'instructivo-pagos.doc', 'application/msword', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-02-15'),
        fechaModificacion: new Date('2024-02-15')
      },
      {
        id: this.nextId++,
        idInciso: 4,
        nombreInciso: 'Inciso 04 - Ministerio de Educación',
        idUnidadEjecutora: 7,
        nombreUnidadEjecutora: 'UE 007 - Dirección Técnica',
        nombreDocumento: 'Formulario de Inscripción Estudiantil',
        descripcionDocumento: 'Formulario para inscripción de estudiantes',
        tipoArchivo: TipoArchivoRepositorio.FORMULARIO,
        archivo: new ArchivoDTO(10, 'inscripcion-estudiantes.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-01-30'),
        fechaModificacion: new Date('2024-01-30')
      },
      {
        id: this.nextId++,
        idInciso: 4,
        nombreInciso: 'Inciso 04 - Ministerio de Educación',
        idUnidadEjecutora: 7,
        nombreUnidadEjecutora: 'UE 007 - Dirección Técnica',
        nombreDocumento: 'Logo Ministerio de Educación',
        descripcionDocumento: 'Logo oficial para documentación',
        tipoArchivo: TipoArchivoRepositorio.LOGO,
        archivo: new ArchivoDTO(11, 'logo-educacion.pdf', 'application/pdf', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-01-08'),
        fechaModificacion: new Date('2024-01-08')
      },
      {
        id: this.nextId++,
        idInciso: 4,
        nombreInciso: 'Inciso 04 - Ministerio de Educación',
        idUnidadEjecutora: 8,
        nombreUnidadEjecutora: 'UE 008 - Infraestructura',
        nombreDocumento: 'Plan de Obras 2024',
        descripcionDocumento: 'Planificación de obras de infraestructura educativa',
        tipoArchivo: TipoArchivoRepositorio.OTRO,
        archivo: new ArchivoDTO(12, 'plan-obras-2024.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-02-20'),
        fechaModificacion: new Date('2024-03-05')
      },
      {
        id: this.nextId++,
        idInciso: 5,
        nombreInciso: 'Inciso 05 - Ministerio de Salud',
        idUnidadEjecutora: 9,
        nombreUnidadEjecutora: 'UE 009 - Administración Hospitalaria',
        nombreDocumento: 'Formulario de Historia Clínica',
        descripcionDocumento: 'Formulario estándar para historias clínicas',
        tipoArchivo: TipoArchivoRepositorio.FORMULARIO,
        archivo: new ArchivoDTO(13, 'historia-clinica.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-01-18'),
        fechaModificacion: new Date('2024-02-22')
      },
      {
        id: this.nextId++,
        idInciso: 5,
        nombreInciso: 'Inciso 05 - Ministerio de Salud',
        idUnidadEjecutora: 9,
        nombreUnidadEjecutora: 'UE 009 - Administración Hospitalaria',
        nombreDocumento: 'Logo Ministerio de Salud',
        descripcionDocumento: 'Logo oficial del ministerio',
        tipoArchivo: TipoArchivoRepositorio.LOGO,
        archivo: new ArchivoDTO(14, 'logo-salud.pdf', 'application/pdf', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-01-07'),
        fechaModificacion: new Date('2024-01-07')
      },
      {
        id: this.nextId++,
        idInciso: 5,
        nombreInciso: 'Inciso 05 - Ministerio de Salud',
        idUnidadEjecutora: 10,
        nombreUnidadEjecutora: 'UE 010 - Farmacia Central',
        nombreDocumento: 'Protocolo de Manejo de Medicamentos',
        descripcionDocumento: 'Documento con protocolos de almacenamiento y distribución',
        tipoArchivo: TipoArchivoRepositorio.OTRO,
        archivo: new ArchivoDTO(15, 'protocolo-medicamentos.pdf', 'application/pdf', 'base64content', false, false, new Date()),
        fechaCreacion: new Date('2024-02-28'),
        fechaModificacion: new Date('2024-02-28')
      }
    ];

    this.documentos = documentosMock;
  }

  obtenerTodos(
    filtro: FiltroDocumentoRepositorioDTO,
    pagina: number = 0,
    tamanoPagina: number = 10,
    sort: string = 'nombreDocumento',
    order: string = 'desc'
  ): Observable<PageModel<DocumentoRepositorioDTO>> {
    let documentosFiltrados = [...this.documentos];

    // Aplicar filtros
    if (filtro.idInciso) {
      documentosFiltrados = documentosFiltrados.filter(doc => doc.idInciso === filtro.idInciso);
    }
    if (filtro.idUnidadEjecutora) {
      documentosFiltrados = documentosFiltrados.filter(doc => doc.idUnidadEjecutora === filtro.idUnidadEjecutora);
    }
    if (filtro.nombreDocumento) {
      const nombreBusqueda = filtro.nombreDocumento.toLowerCase();
      documentosFiltrados = documentosFiltrados.filter(doc =>
        doc.nombreDocumento?.toLowerCase().includes(nombreBusqueda)
      );
    }
    if (filtro.tipoArchivo) {
      documentosFiltrados = documentosFiltrados.filter(doc => doc.tipoArchivo === filtro.tipoArchivo);
    }

    // Ordenar
    documentosFiltrados.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (sort) {
        case 'nombreDocumento':
          valorA = a.nombreDocumento || '';
          valorB = b.nombreDocumento || '';
          break;
        case 'tipoArchivo':
          valorA = a.tipoArchivo || '';
          valorB = b.tipoArchivo || '';
          break;
      }

      if (valorA < valorB) return order === 'asc' ? -1 : 1;
      if (valorA > valorB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginar
    const totalElementos = documentosFiltrados.length;
    const inicio = pagina * tamanoPagina;
    const fin = inicio + tamanoPagina;
    const contenido = documentosFiltrados.slice(inicio, fin);

    const page: PageModel<DocumentoRepositorioDTO> = {
      page: {},
      content: contenido,
      totalElements: totalElementos,
      totalPages: Math.ceil(totalElementos / tamanoPagina),
      size: tamanoPagina,
      number: pagina,
      numberOfElements: contenido.length,
      first: pagina === 0,
      last: pagina >= Math.ceil(totalElementos / tamanoPagina) - 1,
      sort: { sorted: false, unsorted: true, empty: true },
      empty: contenido.length === 0
    };

    return of(page).pipe(delay(300));
  }

  crear(documento: DocumentoRepositorioDTO): Observable<DocumentoRepositorioDTO> {
    // Validar archivo
    if (documento.archivo) {
      const validacion = this.validarArchivo(documento.archivo);
      if (!validacion.valido) {
        throw new Error(validacion.mensaje);
      }
    }

    const nuevoDocumento = new DocumentoRepositorioDTO(
      this.nextId++,
      documento.idInciso,
      documento.nombreInciso,
      documento.idUnidadEjecutora,
      documento.nombreUnidadEjecutora,
      documento.nombreDocumento,
      documento.descripcionDocumento,
      documento.tipoArchivo,
      documento.archivo,
      new Date(),
      new Date()
    );

    this.documentos.unshift(nuevoDocumento);
    return of(nuevoDocumento).pipe(delay(300));
  }

  actualizar(documento: DocumentoRepositorioDTO): Observable<DocumentoRepositorioDTO> {
    if (!documento.id) {
      throw new Error('El documento debe tener un ID para actualizarlo');
    }

    // Validar archivo si se proporcionó uno nuevo
    if (documento.archivo) {
      const validacion = this.validarArchivo(documento.archivo);
      if (!validacion.valido) {
        throw new Error(validacion.mensaje);
      }
    }

    const index = this.documentos.findIndex(doc => doc.id === documento.id);
    if (index === -1) {
      throw new Error('Documento no encontrado');
    }

    const documentoExistente = this.documentos[index];
    const documentoActualizado = new DocumentoRepositorioDTO(
      documento.id,
      documento.idInciso,
      documento.nombreInciso,
      documento.idUnidadEjecutora,
      documento.nombreUnidadEjecutora,
      documento.nombreDocumento,
      documento.descripcionDocumento,
      documento.tipoArchivo,
      documento.archivo || documentoExistente.archivo,
      documentoExistente.fechaCreacion,
      new Date()
    );

    this.documentos[index] = documentoActualizado;
    return of(documentoActualizado).pipe(delay(300));
  }

  obtenerPorId(id: number): Observable<DocumentoRepositorioDTO | undefined> {
    const documento = this.documentos.find(doc => doc.id === id);
    return of(documento).pipe(delay(300));
  }

  eliminar(id: number): Observable<void> {
    const index = this.documentos.findIndex(doc => doc.id === id);
    if (index !== -1) {
      this.documentos.splice(index, 1);
    }
    return of(void 0).pipe(delay(300));
  }

  descargar(id: number): Observable<ArchivoDTO> {
    const documento = this.documentos.find(doc => doc.id === id);
    if (documento && documento.archivo) {
      return of(documento.archivo).pipe(delay(300));
    }
    throw new Error('Documento no encontrado');
  }

  validarArchivo(archivo: IArchivoDTO): { valido: boolean; mensaje: string } {
    // Validar tipo MIME
    if (archivo.mimeType && !this.TIPOS_PERMITIDOS.includes(archivo.mimeType)) {
      return {
        valido: false,
        mensaje: 'Tipo de archivo no permitido. Solo se permiten archivos PDF, Word y Excel.'
      };
    }

    // Validar tamaño (simulado - en el contenido base64)
    if (archivo.contenido) {
      const tamanoBytes = this.calcularTamanoBase64(archivo.contenido);
      if (tamanoBytes > this.MAX_FILE_SIZE_BYTES) {
        return {
          valido: false,
          mensaje: `El archivo excede el tamaño máximo permitido de ${this.MAX_FILE_SIZE_KB} KB.`
        };
      }
    }

    return { valido: true, mensaje: '' };
  }

  private calcularTamanoBase64(base64String: string): number {
    // Calcula el tamaño aproximado en bytes de una cadena base64
    const padding = (base64String.match(/=/g) || []).length;
    return (base64String.length * 3) / 4 - padding;
  }

  obtenerTiposArchivo(): { id: string; nombre: string }[] {
    return [
      { id: '', nombre: 'Todos' },
      { id: TipoArchivoRepositorio.LOGO, nombre: 'Logo' },
      { id: TipoArchivoRepositorio.FORMULARIO, nombre: 'Formulario' },
      { id: TipoArchivoRepositorio.OTRO, nombre: 'Otro' }
    ];
  }
}
