import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Clausula } from '../models/clausula.model';
import { FiltroClausula } from '../models/filtro-clausula.model';
import { EstadoClausula } from '../enum/estado-clausula.enum';

@Injectable({
  providedIn: 'root'
})
export class ClausulaService {
  private clausulasMock: Clausula[] = [
    {
      id: 1,
      denominacion: 'Cláusula de garantía de cumplimiento',
      aperturaElectronica: true,
      tiposCompra: [
        {
          tipoCompraId: 1,
          tipoCompraDescripcion: 'Licitación Pública',
          subtipos: [
            { subtipoCompraId: 1, subtipoCompraDescripcion: 'Nacional' },
            { subtipoCompraId: 2, subtipoCompraDescripcion: 'Internacional' }
          ]
        }
      ],
      objetosCompra: [
        {
          familiaId: 1,
          familiaDescripcion: 'Equipos de computación',
          subfamiliaId: 1,
          subfamiliaDescripcion: 'Computadoras',
          claseId: 1,
          claseDescripcion: 'Notebooks',
          subclaseId: 1,
          subclaseDescripcion: 'Portátiles',
          articulos: [
            { articuloId: 1, articuloCodigo: 'ART001', articuloDescripcion: 'Notebook HP' },
            { articuloId: 2, articuloCodigo: 'ART002', articuloDescripcion: 'Notebook Dell' }
          ]
        }
      ],
      incisos: [
        { incisoId: 1, incisoCodigo: '01', incisoDescripcion: 'Poder Ejecutivo' }
      ],
      unidadesEjecutoras: [
        { unidadEjecutoraId: 1, unidadEjecutoraCodigo: '001', unidadEjecutoraDescripcion: 'Ministerio de Economía' }
      ],
      fechaVigenciaDesde: '2024-01-01',
      fechaVigenciaHasta: '2025-12-31',
      estado: EstadoClausula.VIGENTE,
      versionada: true,
      redacciones: [
        {
          id: 1,
          clausulaId: 1,
          prioridad: 1,
          redaccion: 'El proveedor deberá presentar una garantía de cumplimiento por el 10% del monto total del contrato. Esta garantía deberá mantenerse vigente durante toda la ejecución del contrato y hasta 90 días posteriores a la recepción definitiva de los bienes.',
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
      tiposCompra: [
        {
          tipoCompraId: 2,
          tipoCompraDescripcion: 'Contratación Directa',
          subtipos: [
            { subtipoCompraId: 3, subtipoCompraDescripcion: 'Por excepción' }
          ]
        }
      ],
      objetosCompra: [
        {
          familiaId: 2,
          familiaDescripcion: 'Mobiliario',
          subfamiliaId: 2,
          subfamiliaDescripcion: 'Muebles de oficina',
          claseId: 2,
          claseDescripcion: 'Escritorios',
          subclaseId: 2,
          subclaseDescripcion: 'Ejecutivos',
          articulos: [
            { articuloId: 3, articuloCodigo: 'ART003', articuloDescripcion: 'Escritorio ejecutivo' }
          ]
        }
      ],
      incisos: [
        { incisoId: 2, incisoCodigo: '02', incisoDescripcion: 'Poder Legislativo' }
      ],
      unidadesEjecutoras: [
        { unidadEjecutoraId: 2, unidadEjecutoraCodigo: '002', unidadEjecutoraDescripcion: 'Cámara de Diputados' }
      ],
      fechaVigenciaDesde: '2024-06-01',
      fechaVigenciaHasta: null,
      estado: EstadoClausula.VIGENTE,
      versionada: true,
      redacciones: [
        {
          id: 2,
          clausulaId: 2,
          prioridad: 1,
          redaccion: 'El proveedor se compromete a entregar los bienes en un plazo máximo de 30 días corridos a partir de la fecha de adjudicación. En caso de incumplimiento del plazo, se aplicarán las multas correspondientes según lo establecido en el pliego de condiciones.',
          fechaCreacion: '2024-06-01',
          usuarioCreacion: 'admin',
          fechaModificacion: null,
          usuarioModificacion: null
        },
        {
          id: 3,
          clausulaId: 2,
          prioridad: 2,
          redaccion: 'La entrega deberá realizarse en el lugar indicado por la contratante, corriendo por cuenta del proveedor todos los gastos de transporte, seguro y descarga.',
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
      tiposCompra: [
        {
          tipoCompraId: 1,
          tipoCompraDescripcion: 'Licitación Pública',
          subtipos: [
            { subtipoCompraId: 1, subtipoCompraDescripcion: 'Nacional' }
          ]
        }
      ],
      objetosCompra: [
        {
          familiaId: 1,
          familiaDescripcion: 'Equipos de computación',
          subfamiliaId: 1,
          subfamiliaDescripcion: 'Computadoras',
          claseId: 1,
          claseDescripcion: 'Notebooks',
          subclaseId: 1,
          subclaseDescripcion: 'Portátiles',
          articulos: [
            { articuloId: 1, articuloCodigo: 'ART001', articuloDescripcion: 'Notebook HP' }
          ]
        }
      ],
      incisos: [
        { incisoId: 1, incisoCodigo: '01', incisoDescripcion: 'Poder Ejecutivo' }
      ],
      unidadesEjecutoras: [
        { unidadEjecutoraId: 1, unidadEjecutoraCodigo: '001', unidadEjecutoraDescripcion: 'Ministerio de Economía' }
      ],
      fechaVigenciaDesde: '2023-01-01',
      fechaVigenciaHasta: '2023-12-31',
      estado: EstadoClausula.NO_VIGENTE,
      versionada: true,
      redacciones: [
        {
          id: 4,
          clausulaId: 3,
          prioridad: 1,
          redaccion: 'Los bienes a entregar deberán cumplir con las especificaciones técnicas detalladas en el pliego de condiciones. El proveedor garantiza que los productos son nuevos, de primera calidad y libres de defectos de fabricación.',
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
      tiposCompra: [
        {
          tipoCompraId: 1,
          tipoCompraDescripcion: 'Licitación Pública',
          subtipos: [
            { subtipoCompraId: 1, subtipoCompraDescripcion: 'Nacional' },
            { subtipoCompraId: 2, subtipoCompraDescripcion: 'Internacional' }
          ]
        },
        {
          tipoCompraId: 2,
          tipoCompraDescripcion: 'Contratación Directa',
          subtipos: [
            { subtipoCompraId: 3, subtipoCompraDescripcion: 'Por excepción' }
          ]
        }
      ],
      objetosCompra: [
        {
          familiaId: 3,
          familiaDescripcion: 'Servicios',
          subfamiliaId: 3,
          subfamiliaDescripcion: 'Servicios profesionales',
          claseId: 3,
          claseDescripcion: 'Consultoría',
          subclaseId: 3,
          subclaseDescripcion: 'Asesoría técnica',
          articulos: []
        }
      ],
      incisos: [
        { incisoId: 1, incisoCodigo: '01', incisoDescripcion: 'Poder Ejecutivo' },
        { incisoId: 2, incisoCodigo: '02', incisoDescripcion: 'Poder Legislativo' }
      ],
      unidadesEjecutoras: [
        { unidadEjecutoraId: 1, unidadEjecutoraCodigo: '001', unidadEjecutoraDescripcion: 'Ministerio de Economía' },
        { unidadEjecutoraId: 2, unidadEjecutoraCodigo: '002', unidadEjecutoraDescripcion: 'Cámara de Diputados' }
      ],
      fechaVigenciaDesde: '2024-01-01',
      fechaVigenciaHasta: null,
      estado: EstadoClausula.VIGENTE,
      versionada: true,
      redacciones: [
        {
          id: 5,
          clausulaId: 4,
          prioridad: 1,
          redaccion: 'En caso de incumplimiento de los plazos establecidos en el contrato, se aplicarán penalidades del 0.5% del monto total del contrato por cada día de atraso, hasta un máximo del 10% del valor total. Las penalidades serán descontadas de los pagos a realizar al proveedor.',
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

  buscarClausulas(filtro: FiltroClausula): Observable<Clausula[]> {
    let resultados = [...this.clausulasMock];

    // Aplicar filtros
    if (filtro.incisoId) {
      resultados = resultados.filter(c =>
        c.incisos.some(i => i.incisoId === filtro.incisoId)
      );
    }

    if (filtro.unidadEjecutoraId) {
      resultados = resultados.filter(c =>
        c.unidadesEjecutoras.some(ue => ue.unidadEjecutoraId === filtro.unidadEjecutoraId)
      );
    }

    if (filtro.tipoCompraId) {
      resultados = resultados.filter(c =>
        c.tiposCompra.some(tc => tc.tipoCompraId === filtro.tipoCompraId)
      );
    }

    if (filtro.subtipoCompraId) {
      resultados = resultados.filter(c =>
        c.tiposCompra.some(tc =>
          tc.subtipos.some(st => st.subtipoCompraId === filtro.subtipoCompraId)
        )
      );
    }

    if (filtro.familiaId) {
      resultados = resultados.filter(c =>
        c.objetosCompra.some(oc => oc.familiaId === filtro.familiaId)
      );
    }

    if (filtro.subfamiliaId) {
      resultados = resultados.filter(c =>
        c.objetosCompra.some(oc => oc.subfamiliaId === filtro.subfamiliaId)
      );
    }

    if (filtro.claseId) {
      resultados = resultados.filter(c =>
        c.objetosCompra.some(oc => oc.claseId === filtro.claseId)
      );
    }

    if (filtro.subclaseId) {
      resultados = resultados.filter(c =>
        c.objetosCompra.some(oc => oc.subclaseId === filtro.subclaseId)
      );
    }

    if (filtro.articuloId) {
      resultados = resultados.filter(c =>
        c.objetosCompra.some(oc =>
          oc.articulos.some(art => art.articuloId === filtro.articuloId)
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

  obtenerClausula(id: number): Observable<Clausula | undefined> {
    const clausula = this.clausulasMock.find(c => c.id === id);
    return of(clausula).pipe(delay(200));
  }

  guardarClausula(clausula: Clausula): Observable<Clausula> {
    if (clausula.id) {
      // Actualizar
      const index = this.clausulasMock.findIndex(c => c.id === clausula.id);
      if (index !== -1) {
        this.clausulasMock[index] = { ...clausula };
        return of(this.clausulasMock[index]).pipe(delay(300));
      }
    } else {
      // Crear nuevo
      const nuevoId = Math.max(...this.clausulasMock.map(c => c.id || 0)) + 1;
      const nuevaClausula = { ...clausula, id: nuevoId };
      this.clausulasMock.push(nuevaClausula);
      return of(nuevaClausula).pipe(delay(300));
    }

    return of(clausula).pipe(delay(300));
  }

  eliminarClausula(id: number): Observable<boolean> {
    const index = this.clausulasMock.findIndex(c => c.id === id);
    if (index !== -1) {
      this.clausulasMock.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }
}
