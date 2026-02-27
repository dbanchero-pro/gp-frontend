import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { EstadoElemento } from 'src/app/shared/enum/estado-elemento.enum';
import { ClausulaDTO } from 'src/app/shared/models/pliego/clausula/clausula.model';
import { ModeloDTO } from 'src/app/shared/models/pliego/modelo/modelo.model';
import { TipoCompraClausulaModeloDTO } from 'src/app/shared/models/pliego/comun/tipo-compra-clausula-modelo.model';
import { OrganismoClausulaModeloDTO } from 'src/app/shared/models/pliego/comun/organismo-clausula-modelo.model';
import { ObjetoCompraDTO } from 'src/app/shared/models/pliego/clausula/objeto-compra.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { SubtipoCompraDTO } from 'src/app/shared/models/sice/subtipo-compra.model';
import { IncisoDTO } from 'src/app/shared/models/sice/inciso.model';
import { UnidadEjecutoraDTO } from 'src/app/shared/models/sice/unidad-ejecutora.model';
import { FamiliaDTO } from 'src/app/shared/models/cbso/familia.model';
import { SubfamiliaDTO } from 'src/app/shared/models/cbso/subfamilia.model';
import { ClaseDTO } from 'src/app/shared/models/cbso/clase.model';
import { SubclaseDTO } from 'src/app/shared/models/cbso/subclase.model';
import { ArticuloServObraDTO } from 'src/app/shared/models/cbso/articulo-serv-obra.model';
import { FiltroClausula } from '../models/filtros/filtro-clausula.model';
import { EliminarElementoResponseDTO } from '../models/eliminar-elemento-response.model';

export interface FiltrosClausulaDTO {
  incisos: IncisoDTO[];
  unidadesEjecutoras: UnidadEjecutoraDTO[];
  tiposCompra: TipoCompraDTO[];
  subtiposCompra: SubtipoCompraDTO[];
  familias: FamiliaDTO[];
  subfamilias: SubfamiliaDTO[];
  clases: ClaseDTO[];
  subclases: SubclaseDTO[];
  articulos: ArticuloServObraDTO[];
}

const crearTipoCompraMock = (
  id: string,
  descripcion: string,
  subtipoId?: string,
  subtipoDescripcion?: string
): TipoCompraClausulaModeloDTO => ({
  tipoCompra: new TipoCompraDTO(id, descripcion),
  subtipoCompra: subtipoId ? new SubtipoCompraDTO(id, subtipoId, subtipoDescripcion, descripcion) : undefined
});

const crearObjetoCompraMock = (
  familiaId: number,
  familiaDesc: string,
  subfamiliaId?: number,
  subfamiliaDesc?: string,
  claseId?: number,
  claseDesc?: string,
  subclaseId?: number,
  subclaseDesc?: string,
  articuloId?: number,
  articuloDesc?: string
): ObjetoCompraDTO => ({
  familia: new FamiliaDTO(familiaId, '', familiaDesc),
  subfamilia: subfamiliaId ? new SubfamiliaDTO(subfamiliaId, '', subfamiliaDesc, familiaId.toString()) : undefined,
  clase: claseId ? new ClaseDTO(claseId, claseId, claseDesc, familiaId, subfamiliaId) : undefined,
  subclase: subclaseId
    ? new SubclaseDTO(subclaseId, '', subclaseDesc, familiaId.toString(), subfamiliaId?.toString(), claseId?.toString())
    : undefined,
  articulo: articuloId ? new ArticuloServObraDTO(articuloId, articuloDesc) : undefined
});

const crearOrganismoMock = (
  incisoId: number,
  incisoDesc: string,
  unidadEjecutoraId?: number,
  unidadEjecutoraDesc?: string
): OrganismoClausulaModeloDTO => ({
  inciso: new IncisoDTO(incisoId, incisoDesc),
  unidadEjecutora: unidadEjecutoraId
    ? new UnidadEjecutoraDTO(unidadEjecutoraId, new IncisoDTO(incisoId, incisoDesc), unidadEjecutoraId, unidadEjecutoraDesc)
    : undefined
});

@Injectable({
  providedIn: 'root'
})
export class ClausulaService {
    private clausulasMock: ClausulaDTO[] = [
    {
      id: 100,
      denominacion: 'Cláusula vacía',
      aperturaElectronica: false,
      obligatoria: true,
      editable: true,
      tiposCompra: [
        crearTipoCompraMock('1', 'Licitación Pública', '1', 'Común')
      ],
      objetosCompra: [
        crearObjetoCompraMock(1, 'Equipos de computación', 1, 'Computadoras', 1, 'Notebooks', 1, 'Portátiles', 1, 'Notebook HP')
      ],
      organismo: crearOrganismoMock(1, 'Poder Ejecutivo', 1, 'Ministerio de Economía'),
      fechaVigenciaDesde: '2023-01-01',
      fechaVigenciaHasta: '2023-12-31',
      estado: EstadoElemento.NO_VIGENTE,
      version: 1,
      redacciones: [
        {
          id: 1001,
          prioridad: 1,
          redaccion: '<p>Redacción inicial de referencia para validar render de listas.</p>',
          fechaCreacion: '2023-01-01',
          usuarioCreacion: 'admin',
          fechaModificacion: null,
          usuarioModificacion: null
        }
      ],
      fechaCreacion: '2023-01-01',
      usuarioCreacion: 'admin',
      fechaModificacion: null,
      usuarioModificacion: null
    },
    {
      id: 1,
      denominacion: 'Cláusula de garantía de cumplimiento',
      aperturaElectronica: true,
      obligatoria: true,
      editable: true,
      tiposCompra: [
        crearTipoCompraMock('1', 'Licitación Pública', '1', 'Nacional'),
        crearTipoCompraMock('1', 'Licitación Pública', '2', 'Internacional')
      ],
      objetosCompra: [
        crearObjetoCompraMock(1, 'Equipos de computación', 1, 'Computadoras', 1, 'Notebooks', 1, 'Portátiles', 1, 'Notebook HP')
      ],
      organismo: crearOrganismoMock(1, 'Poder Ejecutivo', 1, 'Ministerio de Economía'),
      fechaVigenciaDesde: '2024-01-01',
      fechaVigenciaHasta: '2025-12-31',
      estado: EstadoElemento.VIGENTE,
      version: 3,
      redacciones: [
        {
          id: 1,
          prioridad: 1,
          redaccion: '<p>El proveedor deberá presentar una <strong>garantía de cumplimiento</strong> por el <em>10% del monto total del contrato</em>.</p><p>Esta garantía deberá mantenerse vigente durante:</p><ul><li>Toda la ejecución del contrato</li><li>Hasta 90 días posteriores a la recepción definitiva de los bienes</li></ul><p>La garantía podrá presentarse en cualquiera de las siguientes formas:</p><ol><li>Póliza de seguro de caución</li><li>Garantía bancaria</li><li>Pagaré con firma certificada</li></ol>',
          fechaCreacion: '2024-01-01',
          usuarioCreacion: 'admin',
          fechaModificacion: null,
          usuarioModificacion: null
        }
      ],
      fechaCreacion: '2024-01-01',
      usuarioCreacion: 'admin',
      fechaModificacion: null,
      usuarioModificacion: null
    },
    {
      id: 2,
      denominacion: 'Cláusula de plazo de entrega',
      aperturaElectronica: true,
      obligatoria: true,
      editable: true,
      tiposCompra: [
        crearTipoCompraMock('2', 'Contratación Directa', '3', 'Por excepción')
      ],
      objetosCompra: [
        crearObjetoCompraMock(2, 'Mobiliario', 2, 'Muebles de oficina', 2, 'Escritorios', 2, 'Ejecutivos', 3, 'Escritorio ejecutivo')
      ],
      organismo: crearOrganismoMock(2, 'Poder Legislativo', 2, 'Cámara de Diputados'),
      fechaVigenciaDesde: '2024-06-01',
      fechaVigenciaHasta: null,
      estado: EstadoElemento.VIGENTE,
      version: 1,
      redacciones: [
        {
          id: 2,
          prioridad: 1,
          redaccion: '<p>El proveedor se compromete a entregar los bienes en un <strong>plazo máximo de 30 días corridos</strong> a partir de la fecha de adjudicación.</p><p>En caso de <span style="color: #d32f2f;">incumplimiento del plazo</span>, se aplicarán las multas correspondientes según lo establecido en el pliego de condiciones.</p>',
          fechaCreacion: '2024-06-01',
          usuarioCreacion: 'admin',
          fechaModificacion: null,
          usuarioModificacion: null
        },
        {
          id: 3,
          prioridad: 2,
          redaccion: '<p>La entrega deberá realizarse en el lugar indicado por la contratante, corriendo por cuenta del proveedor todos los gastos de:</p><ul><li><strong>Transporte</strong></li><li><strong>Seguro</strong></li><li><strong>Descarga</strong></li></ul>',
          fechaCreacion: '2024-06-01',
          usuarioCreacion: 'admin',
          fechaModificacion: null,
          usuarioModificacion: null
        }
      ],
      fechaCreacion: '2024-06-01',
      usuarioCreacion: 'admin',
      fechaModificacion: null,
      usuarioModificacion: null
    },
    {
      id: 3,
      denominacion: 'Cláusula de calidad y especificaciones técnicas',
      aperturaElectronica: false,
      obligatoria: true,
      editable: true,
      tiposCompra: [
        crearTipoCompraMock('1', 'Licitación Pública', '1', 'Nacional')
      ],
      objetosCompra: [
        crearObjetoCompraMock(1, 'Equipos de computación', 1, 'Computadoras', 1, 'Notebooks', 1, 'Portátiles', 1, 'Notebook HP')
      ],
      organismo: crearOrganismoMock(1, 'Poder Ejecutivo', 1, 'Ministerio de Economía'),
      fechaVigenciaDesde: '2023-01-01',
      fechaVigenciaHasta: '2023-12-31',
      estado: EstadoElemento.NO_VIGENTE,
      version: 1,
      redacciones: [
        {
          id: 4,
          prioridad: 1,
          redaccion: '<p>Los bienes a entregar deberán cumplir con las <strong>especificaciones técnicas</strong> detalladas en el pliego de condiciones.</p><p>El proveedor garantiza que los productos son:</p><ul><li>Nuevos</li><li>De primera calidad</li><li>Libres de defectos de fabricación</li></ul><blockquote><em>Nota: Se realizarán inspecciones de calidad durante la recepción de los bienes.</em></blockquote>',
          fechaCreacion: '2023-01-01',
          usuarioCreacion: 'admin',
          fechaModificacion: null,
          usuarioModificacion: null
        }
      ],
      fechaCreacion: '2023-01-01',
      usuarioCreacion: 'admin',
      fechaModificacion: null,
      usuarioModificacion: null
    },
    {
      id: 4,
      denominacion: 'Cláusula de penalidades',
      aperturaElectronica: true,
      obligatoria: true,
      editable: true,
      tiposCompra: [
        crearTipoCompraMock('1', 'Licitación Pública', '1', 'Nacional'),
        crearTipoCompraMock('1', 'Licitación Pública', '2', 'Internacional'),
        crearTipoCompraMock('2', 'Contratación Directa', '3', 'Por excepción')
      ],
      objetosCompra: [
        crearObjetoCompraMock(3, 'Servicios', 3, 'Servicios profesionales', 3, 'Consultoría', 3, 'Asesoría técnica')
      ],
      organismo: crearOrganismoMock(1, 'Poder Ejecutivo', 1, 'Ministerio de Economía'),
      fechaVigenciaDesde: '2024-01-01',
      fechaVigenciaHasta: null,
      estado: EstadoElemento.VIGENTE,
      version: 2,
      redacciones: [
        {
          id: 5,
          prioridad: 1,
          redaccion: '<p>En caso de incumplimiento de los plazos establecidos en el contrato, se aplicarán penalidades según el siguiente esquema:</p><table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;"><thead><tr style="background-color: #f5f5f5;"><th>Concepto</th><th>Porcentaje</th></tr></thead><tbody><tr><td>Penalidad diaria</td><td><strong>0.5%</strong> del monto total</td></tr><tr><td>Penalidad máxima</td><td><strong>10%</strong> del valor total</td></tr></tbody></table><p><em>Las penalidades serán descontadas de los pagos a realizar al proveedor.</em></p>',
          fechaCreacion: '2024-01-01',
          usuarioCreacion: 'admin',
          fechaModificacion: null,
          usuarioModificacion: null
        }
      ],
      fechaCreacion: '2024-01-01',
      usuarioCreacion: 'admin',
      fechaModificacion: null,
      usuarioModificacion: null
    }
  ];

  constructor() {}

  obtenerFiltrosClausula(): Observable<FiltrosClausulaDTO> {
    const incisos = [
      new IncisoDTO(1, 'Poder Ejecutivo'),
      new IncisoDTO(2, 'Poder Legislativo'),
      new IncisoDTO(3, 'Poder Judicial')
    ];

    const unidadesEjecutoras = [
      new UnidadEjecutoraDTO(1, new IncisoDTO(1, 'Poder Ejecutivo'), 1, 'Ministerio de Economia'),
      new UnidadEjecutoraDTO(2, new IncisoDTO(2, 'Poder Legislativo'), 2, 'Camara de Diputados'),
      new UnidadEjecutoraDTO(3, new IncisoDTO(1, 'Poder Ejecutivo'), 3, 'Ministerio de Salud')
    ];

    const tiposCompra = [
      new TipoCompraDTO('1', 'Licitacion Publica'),
      new TipoCompraDTO('2', 'Contratacion Directa'),
      new TipoCompraDTO('3', 'Licitacion Abreviada')
    ];

    const subtiposCompra = [
      new SubtipoCompraDTO('1', '1', 'Nacional', 'Licitacion Publica'),
      new SubtipoCompraDTO('1', '2', 'Internacional', 'Licitacion Publica'),
      new SubtipoCompraDTO('2', '3', 'Por excepcion', 'Contratacion Directa')
    ];

    const familias = [
      new FamiliaDTO(1, 'FAM001', 'Equipos de computacion'),
      new FamiliaDTO(2, 'FAM002', 'Mobiliario'),
      new FamiliaDTO(3, 'FAM003', 'Servicios')
    ];

    const subfamilias = [
      new SubfamiliaDTO(1, 'SUB001', 'Computadoras', '1'),
      new SubfamiliaDTO(2, 'SUB002', 'Muebles de oficina', '2'),
      new SubfamiliaDTO(3, 'SUB003', 'Servicios profesionales', '3')
    ];

    const clases = [
      new ClaseDTO(1, 1, 'Notebooks', 1, 1),
      new ClaseDTO(2, 2, 'Escritorios', 2, 2),
      new ClaseDTO(3, 3, 'Consultoria', 3, 3)
    ];

    const subclases = [
      new SubclaseDTO(1, 'SCLA001', 'Portatiles', '1', '1', '1'),
      new SubclaseDTO(2, 'SCLA002', 'Ejecutivos', '2', '2', '2'),
      new SubclaseDTO(3, 'SCLA003', 'Asesoria tecnica', '3', '3', '3')
    ];

    const articulos = [
      new ArticuloServObraDTO(1, 'Notebook HP'),
      new ArticuloServObraDTO(2, 'Notebook Dell'),
      new ArticuloServObraDTO(3, 'Escritorio ejecutivo')
    ];

    return of({
      incisos,
      unidadesEjecutoras,
      tiposCompra,
      subtiposCompra,
      familias,
      subfamilias,
      clases,
      subclases,
      articulos
    }).pipe(delay(200));
  }

  buscarClausulas(filtro: FiltroClausula): Observable<ClausulaDTO[]> {
    let resultados = [...this.clausulasMock];

    // Aplicar filtros
    if (filtro.incisoId) {
      resultados = resultados.filter(c =>
        c.organismo?.inciso?.id === filtro.incisoId
      );
    }

    if (filtro.unidadEjecutoraId) {
      resultados = resultados.filter(c =>
        c.organismo?.unidadEjecutora?.id === filtro.unidadEjecutoraId
      );
    }

    if (filtro.tipoCompraId) {
      resultados = resultados.filter(c =>
        c.tiposCompra?.some(tc => tc.tipoCompra?.id === filtro.tipoCompraId)
      );
    }

    if (filtro.subtipoCompraId) {
      resultados = resultados.filter(c =>
        c.tiposCompra?.some(tc => tc.subtipoCompra?.idSubtipoCompra === filtro.subtipoCompraId)
      );
    }

    if (filtro.familiaId) {
      resultados = resultados.filter(c =>
        c.objetosCompra.some(oc => oc.familia?.id === filtro.familiaId)
      );
    }

    if (filtro.subfamiliaId) {
      resultados = resultados.filter(c =>
        c.objetosCompra.some(oc => oc.subfamilia?.id === filtro.subfamiliaId)
      );
    }

    if (filtro.claseId) {
      resultados = resultados.filter(c =>
        c.objetosCompra.some(oc => oc.clase?.id === filtro.claseId)
      );
    }

    if (filtro.subclaseId) {
      resultados = resultados.filter(c =>
        c.objetosCompra.some(oc => oc.subclase?.id === filtro.subclaseId)
      );
    }

    if (filtro.articuloId) {
      resultados = resultados.filter(c =>
        c.objetosCompra.some(oc =>
          oc.articulo?.id === filtro.articuloId
        )
      );
    }

    if (filtro.denominacion) {
      const denominacionLower = filtro.denominacion.toLowerCase();
      resultados = resultados.filter(c =>
        c.denominacion.toLowerCase().includes(denominacionLower)
      );
    }

    if (filtro.fechaVigenciaDesde) {
      resultados = resultados.filter(c =>
        c.fechaVigenciaDesde && filtro.fechaVigenciaDesde && c.fechaVigenciaDesde >= filtro.fechaVigenciaDesde
      );
    }

    if (filtro.fechaVigenciaHasta) {
      resultados = resultados.filter(c =>
        !c.fechaVigenciaHasta || (filtro.fechaVigenciaHasta && c.fechaVigenciaHasta <= filtro.fechaVigenciaHasta)
      );
    }

    // Simular delay de red
    return of(resultados).pipe(delay(300));
  }

  obtenerClausula(id: number): Observable<ClausulaDTO | undefined> {
    const clausula = this.clausulasMock.find(c => c.id === id);
    return of(clausula).pipe(delay(200));
  }

  obtenerClausulaPorId(id: number): Observable<ClausulaDTO | undefined> {
    const clausula = this.clausulasMock.find(c => c.id === id);
    return of(clausula).pipe(delay(200));
  }

  crearClausula(clausula: ClausulaDTO): Observable<ClausulaDTO> {
    const nuevoId = Math.max(...this.clausulasMock.map(c => c.id || 0)) + 1;
    const nuevaClausula = {
      ...clausula,
      id: nuevoId,
      estado: EstadoElemento.BORRADOR,
      version: 1,

      fechaCreacion: new Date().toISOString().split('T')[0],
      usuarioCreacion: 'usuario_actual',
      fechaModificacion: null,
      usuarioModificacion: null
    };
    this.clausulasMock.push(nuevaClausula);
    return of(nuevaClausula).pipe(delay(300));
  }

  actualizarClausula(id: number, clausula: ClausulaDTO): Observable<ClausulaDTO> {
    const index = this.clausulasMock.findIndex(c => c.id === id);
    if (index !== -1) {
      const clausulaActualizada = {
        ...clausula,
        id,
        fechaModificacion: new Date().toISOString().split('T')[0],
        usuarioModificacion: 'usuario_actual'
      };
      this.clausulasMock[index] = clausulaActualizada;
      return of(clausulaActualizada).pipe(delay(300));
    }
    return of(clausula).pipe(delay(300));
  }

  aprobarClausula(id: number): Observable<ClausulaDTO> {
    const index = this.clausulasMock.findIndex(c => c.id === id);
    if (index !== -1) {
      const clausulaActual = this.clausulasMock[index];

      const versionAprobada = {
        ...clausulaActual,
        estado: EstadoElemento.VIGENTE,

        version: (clausulaActual.version || 1),
        fechaModificacion: new Date().toISOString().split('T')[0],
        usuarioModificacion: 'usuario_actual'
      };
      this.clausulasMock[index] = versionAprobada;

      const nuevoId = Math.max(...this.clausulasMock.map(c => c.id || 0)) + 1;
      const versionEditable = {
        ...versionAprobada,
        id: nuevoId,
        estado: EstadoElemento.BORRADOR,
        version: (versionAprobada.version || 1) + 1,

        fechaVigenciaDesde: '',
        fechaVigenciaHasta: null,
        fechaCreacion: new Date().toISOString().split('T')[0],
        usuarioCreacion: 'usuario_actual',
        fechaModificacion: null,
        usuarioModificacion: null
      };
      this.clausulasMock.push(versionEditable);

      return of(versionAprobada).pipe(delay(300));
    }
    throw new Error('Cláusula no encontrada');
  }

  guardarClausula(clausula: ClausulaDTO): Observable<ClausulaDTO> {
    if (clausula.id) {
      return this.actualizarClausula(clausula.id, clausula);
    } else {
      return this.crearClausula(clausula);
    }
  }

  eliminarClausula(id: number): Observable<EliminarElementoResponseDTO> {
    const clausula = this.clausulasMock.find(c => c.id === id);

    if (!clausula) {
      const response: EliminarElementoResponseDTO = {
        exitoso: false,
        mensaje: 'No se encontró la cláusula especificada.',
        tipoEliminacion: 'FISICA'
      };
      return of(response).pipe(delay(300));
    }

    // Verificar si tiene versión editable (estado BORRADOR)
    const tieneVersionEditable = clausula.estado === EstadoElemento.BORRADOR;

    if (tieneVersionEditable) {
      // Eliminar versión editable y restaurar versión anterior aprobada
      return this.eliminarVersionEditable(id);
    } else {
      // Es una versión aprobada única
      return this.eliminarVersionAprobada(id, clausula);
    }
  }

  private eliminarVersionEditable(id: number): Observable<EliminarElementoResponseDTO> {
    // Simular eliminación de versión editable
    // En realidad, aquí se eliminaría la versión BORRADOR y se restauraría la versión anterior aprobada
    const index = this.clausulasMock.findIndex(c => c.id === id);

    if (index !== -1) {
      this.clausulasMock.splice(index, 1);
      const response: EliminarElementoResponseDTO = {
        exitoso: true,
        mensaje: 'Se eliminó la versión editable y se restauró la versión anteriormente aprobada.',
        tipoEliminacion: 'VERSION_EDITABLE'
      };
      return of(response).pipe(delay(300));
    }

    const response: EliminarElementoResponseDTO = {
      exitoso: false,
      mensaje: 'No se pudo eliminar la versión editable.',
      tipoEliminacion: 'VERSION_EDITABLE'
    };
    return of(response).pipe(delay(300));
  }

  private eliminarVersionAprobada(id: number, clausula: ClausulaDTO): Observable<EliminarElementoResponseDTO> {

    // Baja física: eliminar completamente
    const index = this.clausulasMock.findIndex(c => c.id === id);
    if (index !== -1) {
      this.clausulasMock.splice(index, 1);
    }

    const response: EliminarElementoResponseDTO = {
      exitoso: true,
      mensaje: 'La cláusula se eliminó completamente (baja física).',
      tipoEliminacion: 'FISICA'
    };
    return of(response).pipe(delay(300));
  }

  obtenerHistorialVersiones(clausulaId: number): Observable<ClausulaDTO[]> {
        const historialMock: ClausulaDTO[] = [
      {
        id: 101,
        denominacion: 'Cláusula vacía',
        aperturaElectronica: true,
        obligatoria: true,
        editable: true,
        tiposCompra: [
          crearTipoCompraMock('1', 'Licitación Pública', '1', 'Nacional')
        ],
        objetosCompra: [
          crearObjetoCompraMock(1, 'Equipos de computación', 1, 'Computadoras', 1, 'Notebooks', 1, 'Portátiles', 1, 'Notebook HP')
        ],
        organismo: crearOrganismoMock(1, 'Poder Ejecutivo', 1, 'Ministerio de Economía'),
        fechaVigenciaDesde: '2024-01-01',
        fechaVigenciaHasta: '2025-12-31',
        estado: EstadoElemento.VIGENTE,
        version: 3,
        redacciones: [
          {
            id: 2101,
            prioridad: 1,
            redaccion: '<p>Versión aprobada sin cambios sustantivos.</p>',
            fechaCreacion: '2024-10-15',
            usuarioCreacion: 'admin',
            fechaModificacion: null,
            usuarioModificacion: null
          }
        ],
        fechaCreacion: '2024-10-15',
        usuarioCreacion: 'admin',
        fechaModificacion: '2024-10-15',
        usuarioModificacion: 'admin'
      },
      {
        id: 102,
        denominacion: 'Cláusula de garantía de cumplimiento',
        aperturaElectronica: true,
        obligatoria: true,
        editable: true,
        tiposCompra: [
          crearTipoCompraMock('1', 'Licitación Pública', '1', 'Nacional')
        ],
        objetosCompra: [
          crearObjetoCompraMock(1, 'Equipos de computación', 1, 'Computadoras', 1, 'Notebooks')
        ],
        organismo: crearOrganismoMock(1, 'Poder Ejecutivo'),
        fechaVigenciaDesde: '2023-06-01',
        fechaVigenciaHasta: '2024-12-31',
        estado: EstadoElemento.NO_VIGENTE,
        version: 2,
        redacciones: [
          {
            id: 2,
            prioridad: 1,
            redaccion: '<p>El proveedor deberá presentar una <strong>garantía de cumplimiento</strong> por el <em>8% del monto total del contrato</em>.</p>',
            fechaCreacion: '2023-06-01',
            usuarioCreacion: 'admin',
            fechaModificacion: null,
            usuarioModificacion: null
          }
        ],
        fechaCreacion: '2023-06-01',
        usuarioCreacion: 'admin',
        fechaModificacion: '2023-06-01',
        usuarioModificacion: 'admin'
      },
      {
        id: 103,
        denominacion: 'Cláusula de garantía de cumplimiento',
        aperturaElectronica: false,
        obligatoria: true,
        editable: true,
        tiposCompra: [
          crearTipoCompraMock('1', 'Licitación Pública', '1', 'Nacional')
        ],
        objetosCompra: [
          crearObjetoCompraMock(1, 'Equipos de computación')
        ],
        organismo: crearOrganismoMock(1, 'Poder Ejecutivo'),
        fechaVigenciaDesde: '2022-01-01',
        fechaVigenciaHasta: '2023-05-31',
        estado: EstadoElemento.NO_VIGENTE,
        version: 1,
        redacciones: [
          {
            id: 3,
            prioridad: 1,
            redaccion: '<p>El proveedor deberá presentar una <strong>garantía de cumplimiento</strong> por el <em>5% del monto total del contrato</em>.</p>',
            fechaCreacion: '2022-01-01',
            usuarioCreacion: 'admin',
            fechaModificacion: null,
            usuarioModificacion: null
          }
        ],
        fechaCreacion: '2022-01-01',
        usuarioCreacion: 'admin',
        fechaModificacion: '2022-01-01',
        usuarioModificacion: 'admin'
      }
    ];

    return of(historialMock).pipe(delay(300));
  }

  obtenerVersionAnterior(clausulaId: number): Observable<ClausulaDTO | null> {
    return this.obtenerHistorialVersiones(clausulaId).pipe(
      delay(300),
      map(versiones => {
        if (versiones.length < 2) {
          return null;
        }
        const versionesOrdenadas = versiones.sort((a, b) => (b.version || 0) - (a.version || 0));
        return versionesOrdenadas[1];
      })
    );
  }

  obtenerModelosPorClausula(clausulaId: number): Observable<any[]> {
        const modelosMock: ModeloDTO[] = [
      {
        id: 1,
        denominacion: 'Modelo de Licitación Pública Nacional',
        fechaVigenciaDesde: '2024-01-01',
        fechaVigenciaHasta: '2025-12-31',
        estado: EstadoElemento.VIGENTE,
        version: 1,
        secciones: [{
          id: 11,
          orden: 1,
          seccion: {
            id: 101,
            denominacion: 'Seccion general',
            capitulos: [],
            clausulas: [],
            estado: EstadoElemento.VIGENTE
          }
        } as any],
        tiposCompra: [crearTipoCompraMock('1', 'Licitación PÃºblica', '1', 'Nacional')],
        organismo: undefined,
        fechaCreacion: '2024-01-01',
        usuarioCreacion: 'admin',
        fechaModificacion: null,
        usuarioModificacion: null
      },
      {
        id: 2,
        denominacion: 'Modelo de Contratación Directa',
        fechaVigenciaDesde: '2024-06-01',
        fechaVigenciaHasta: null,
        estado: EstadoElemento.VIGENTE,
        version: 2,
        secciones: [{
          id: 21,
          orden: 1,
          seccion: {
            id: 201,
            denominacion: 'Seccion tecnica',
            capitulos: [],
            clausulas: [],
            estado: EstadoElemento.VIGENTE
          }
        } as any],
        tiposCompra: [crearTipoCompraMock('2', 'Contratación Directa', '3', 'Por excepción')],
        organismo: undefined,
        fechaCreacion: '2024-06-01',
        usuarioCreacion: 'admin',
        fechaModificacion: null,
        usuarioModificacion: null
      },
      {
        id: 3,
        denominacion: 'Modelo Borrador - Obras Públicas',
        fechaVigenciaDesde: '2025-01-01',
        fechaVigenciaHasta: '2025-12-31',
        estado: EstadoElemento.BORRADOR,
        version: 1,
        secciones: [{
          id: 31,
          orden: 1,
          seccion: {
            id: 301,
            denominacion: 'Seccion borrador',
            capitulos: [],
            clausulas: [],
            estado: EstadoElemento.BORRADOR
          }
        } as any],
        tiposCompra: [crearTipoCompraMock('3', 'Licitación Abreviada')],
        organismo: undefined,
        fechaCreacion: '2025-01-01',
        usuarioCreacion: 'admin',
        fechaModificacion: null,
        usuarioModificacion: null
      }
    ];

    return of(modelosMock).pipe(delay(300));
  }
}







