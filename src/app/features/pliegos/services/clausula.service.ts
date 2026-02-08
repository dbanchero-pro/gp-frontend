import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Clausula } from '../models/clausula.model';
import { FiltroClausula } from '../models/filtro-clausula.model';
import { EstadoClausula } from '../enum/estado-clausula.enum';
import { EliminarClausulaResponse } from '../models/eliminar-clausula-response.model';

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
          articulo: { articuloId: 1, articuloCodigo: 'ART001', articuloDescripcion: 'Notebook HP' }
        }
      ],
      incisos: [
        {
          incisoId: 1,
          incisoCodigo: '01',
          incisoDescripcion: 'Poder Ejecutivo',
          unidadEjecutora: { unidadEjecutoraId: 1, unidadEjecutoraCodigo: '001', unidadEjecutoraDescripcion: 'Ministerio de Economía' }
        }
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
          articulo: { articuloId: 3, articuloCodigo: 'ART003', articuloDescripcion: 'Escritorio ejecutivo' }
        }
      ],
      incisos: [
        {
          incisoId: 2,
          incisoCodigo: '02',
          incisoDescripcion: 'Poder Legislativo',
          unidadEjecutora: { unidadEjecutoraId: 2, unidadEjecutoraCodigo: '002', unidadEjecutoraDescripcion: 'Cámara de Diputados' }
        }
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
          redaccion: '<p>El proveedor se compromete a entregar los bienes en un <strong>plazo máximo de 30 días corridos</strong> a partir de la fecha de adjudicación.</p><p>En caso de <span style="color: #d32f2f;">incumplimiento del plazo</span>, se aplicarán las multas correspondientes según lo establecido en el pliego de condiciones.</p>',
          fechaCreacion: '2024-06-01',
          usuarioCreacion: 'admin',
          fechaModificacion: null,
          usuarioModificacion: null
        },
        {
          id: 3,
          clausulaId: 2,
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
          articulo: { articuloId: 1, articuloCodigo: 'ART001', articuloDescripcion: 'Notebook HP' }
        }
      ],
      incisos: [
        {
          incisoId: 1,
          incisoCodigo: '01',
          incisoDescripcion: 'Poder Ejecutivo',
          unidadEjecutora: { unidadEjecutoraId: 1, unidadEjecutoraCodigo: '001', unidadEjecutoraDescripcion: 'Ministerio de Economía' }
        }
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
          articulo: null
        }
      ],
      incisos: [
        {
          incisoId: 1,
          incisoCodigo: '01',
          incisoDescripcion: 'Poder Ejecutivo',
          unidadEjecutora: { unidadEjecutoraId: 1, unidadEjecutoraCodigo: '001', unidadEjecutoraDescripcion: 'Ministerio de Economía' }
        },
        {
          incisoId: 2,
          incisoCodigo: '02',
          incisoDescripcion: 'Poder Legislativo',
          unidadEjecutora: null
        }
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
        c.incisos.some(i => i.unidadEjecutora?.unidadEjecutoraId === filtro.unidadEjecutoraId)
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
          oc.articulo?.articuloId === filtro.articuloId
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

  obtenerClausulaPorId(id: number): Observable<Clausula | undefined> {
    const clausula = this.clausulasMock.find(c => c.id === id);
    return of(clausula).pipe(delay(200));
  }

  crearClausula(clausula: Clausula): Observable<Clausula> {
    const nuevoId = Math.max(...this.clausulasMock.map(c => c.id || 0)) + 1;
    const nuevaClausula = {
      ...clausula,
      id: nuevoId,
      estado: EstadoClausula.BORRADOR,
      version: 1,
      versionada: false,
      fechaCreacion: new Date().toISOString().split('T')[0],
      usuarioCreacion: 'usuario_actual',
      fechaModificacion: null,
      usuarioModificacion: null
    };
    this.clausulasMock.push(nuevaClausula);
    return of(nuevaClausula).pipe(delay(300));
  }

  actualizarClausula(id: number, clausula: Clausula): Observable<Clausula> {
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

  aprobarClausula(id: number): Observable<Clausula> {
    const index = this.clausulasMock.findIndex(c => c.id === id);
    if (index !== -1) {
      const clausulaActual = this.clausulasMock[index];

      const versionAprobada = {
        ...clausulaActual,
        estado: EstadoClausula.VIGENTE,
        versionada: true,
        version: (clausulaActual.version || 1),
        fechaModificacion: new Date().toISOString().split('T')[0],
        usuarioModificacion: 'usuario_actual'
      };
      this.clausulasMock[index] = versionAprobada;

      const nuevoId = Math.max(...this.clausulasMock.map(c => c.id || 0)) + 1;
      const versionEditable = {
        ...versionAprobada,
        id: nuevoId,
        estado: EstadoClausula.BORRADOR,
        version: (versionAprobada.version || 1) + 1,
        versionada: false,
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

  guardarClausula(clausula: Clausula): Observable<Clausula> {
    if (clausula.id) {
      return this.actualizarClausula(clausula.id, clausula);
    } else {
      return this.crearClausula(clausula);
    }
  }

  eliminarClausula(id: number): Observable<EliminarClausulaResponse> {
    const clausula = this.clausulasMock.find(c => c.id === id);

    if (!clausula) {
      const response: EliminarClausulaResponse = {
        exitoso: false,
        mensaje: 'No se encontró la cláusula especificada.',
        tipoEliminacion: 'FISICA'
      };
      return of(response).pipe(delay(300));
    }

    // Verificar si tiene versión editable (estado BORRADOR)
    const tieneVersionEditable = clausula.estado === EstadoClausula.BORRADOR;

    if (tieneVersionEditable) {
      // Eliminar versión editable y restaurar versión anterior aprobada
      return this.eliminarVersionEditable(id);
    } else {
      // Es una versión aprobada única
      return this.eliminarVersionAprobada(id, clausula);
    }
  }

  private eliminarVersionEditable(id: number): Observable<EliminarClausulaResponse> {
    // Simular eliminación de versión editable
    // En realidad, aquí se eliminaría la versión BORRADOR y se restauraría la versión anterior aprobada
    const index = this.clausulasMock.findIndex(c => c.id === id);

    if (index !== -1) {
      this.clausulasMock.splice(index, 1);
      const response: EliminarClausulaResponse = {
        exitoso: true,
        mensaje: 'Se eliminó la versión editable y se restauró la versión anteriormente aprobada.',
        tipoEliminacion: 'VERSION_EDITABLE'
      };
      return of(response).pipe(delay(300));
    }

    const response: EliminarClausulaResponse = {
      exitoso: false,
      mensaje: 'No se pudo eliminar la versión editable.',
      tipoEliminacion: 'VERSION_EDITABLE'
    };
    return of(response).pipe(delay(300));
  }

  private eliminarVersionAprobada(id: number, clausula: Clausula): Observable<EliminarClausulaResponse> {

    // Baja física: eliminar completamente
    const index = this.clausulasMock.findIndex(c => c.id === id);
    if (index !== -1) {
      this.clausulasMock.splice(index, 1);
    }

    const response: EliminarClausulaResponse = {
      exitoso: true,
      mensaje: 'La cláusula se eliminó completamente (baja física).',
      tipoEliminacion: 'FISICA'
    };
    return of(response).pipe(delay(300));
  }

  obtenerHistorialVersiones(clausulaId: number): Observable<Clausula[]> {
    const historialMock: Clausula[] = [
      {
        id: 101,
        denominacion: 'Cláusula de garantía de cumplimiento',
        aperturaElectronica: true,
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
            articulo: { articuloId: 1, articuloCodigo: 'ART001', articuloDescripcion: 'Notebook HP' }
          }
        ],
        incisos: [
          {
            incisoId: 1,
            incisoCodigo: '01',
            incisoDescripcion: 'Poder Ejecutivo',
            unidadEjecutora: { unidadEjecutoraId: 1, unidadEjecutoraCodigo: '001', unidadEjecutoraDescripcion: 'Ministerio de Economía' }
          }
        ],
        fechaVigenciaDesde: '2024-01-01',
        fechaVigenciaHasta: '2025-12-31',
        estado: EstadoClausula.VIGENTE,
        versionada: true,
        version: 3,
        redacciones: [
          {
            id: 1,
            clausulaId: 101,
            prioridad: 1,
            redaccion: '<p>El proveedor deberá presentar una <strong>garantía de cumplimiento</strong> por el <em>10% del monto total del contrato</em>.</p>',
            fechaCreacion: '2024-01-01',
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
            claseId: null,
            claseDescripcion: null,
            subclaseId: null,
            subclaseDescripcion: null,
            articulo: null
          }
        ],
        incisos: [
          {
            incisoId: 1,
            incisoCodigo: '01',
            incisoDescripcion: 'Poder Ejecutivo',
            unidadEjecutora: null
          }
        ],
        fechaVigenciaDesde: '2023-06-01',
        fechaVigenciaHasta: '2024-12-31',
        estado: EstadoClausula.NO_VIGENTE,
        versionada: true,
        version: 2,
        redacciones: [
          {
            id: 2,
            clausulaId: 102,
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
            subfamiliaId: null,
            subfamiliaDescripcion: null,
            claseId: null,
            claseDescripcion: null,
            subclaseId: null,
            subclaseDescripcion: null,
            articulo: null
          }
        ],
        incisos: [
          {
            incisoId: 1,
            incisoCodigo: '01',
            incisoDescripcion: 'Poder Ejecutivo',
            unidadEjecutora: null
          }
        ],
        fechaVigenciaDesde: '2022-01-01',
        fechaVigenciaHasta: '2023-05-31',
        estado: EstadoClausula.NO_VIGENTE,
        versionada: true,
        version: 1,
        redacciones: [
          {
            id: 3,
            clausulaId: 103,
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
}

