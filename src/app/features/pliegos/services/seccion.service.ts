import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Seccion } from '../models/seccion.model';
import { FiltroSeccion } from '../models/filtro-seccion.model';
import { EstadoClausula } from '../enum/estado-clausula.enum';
import { EliminarSeccionResponse } from '../models/eliminar-seccion-response.model';

@Injectable({
  providedIn: 'root'
})
export class SeccionService {
  private seccionesMock: Seccion[] = [
    {
      id: 1,
      denominacion: 'Sección de Condiciones Generales del Contrato',
      fechaVigenciaDesde: '2024-01-01',
      fechaVigenciaHasta: '2025-12-31',
      estado: EstadoClausula.VIGENTE,
      versionada: true,
      version: 1,
      capitulos: [
        {
          capituloId: 1,
          orden: 1,
          denominacion: 'Capítulo de Condiciones Generales',
          version: 1,
          clausulas: [
            {
              clausulaId: 1,
              orden: 1,
              denominacion: 'Cláusula de garantía de cumplimiento',
              version: 1
            },
            {
              clausulaId: 2,
              orden: 2,
              denominacion: 'Cláusula de plazo de entrega',
              version: 1
            }
          ]
        },
        {
          capituloId: 2,
          orden: 2,
          denominacion: 'Capítulo de Requisitos Técnicos',
          version: 2,
          clausulas: [
            {
              clausulaId: 3,
              orden: 1,
              denominacion: 'Cláusula de calidad y especificaciones técnicas',
              version: 1
            }
          ]
        }
      ],
      clausulas: [],
      fechaCreacion: '2024-01-01',
      usuarioCreacion: 'admin',
      fechaModificacion: null,
      usuarioModificacion: null
    },
    {
      id: 2,
      denominacion: 'Sección de Obligaciones y Responsabilidades',
      fechaVigenciaDesde: '2024-03-01',
      fechaVigenciaHasta: null,
      estado: EstadoClausula.VIGENTE,
      versionada: true,
      version: 1,
      capitulos: [
        {
          capituloId: 3,
          orden: 1,
          denominacion: 'Capítulo de Garantías',
          version: 1,
          clausulas: [
            {
              clausulaId: 1,
              orden: 1,
              denominacion: 'Cláusula de garantía de cumplimiento',
              version: 1
            }
          ]
        }
      ],
      clausulas: [],
      fechaCreacion: '2024-03-01',
      usuarioCreacion: 'admin',
      fechaModificacion: '2024-03-15',
      usuarioModificacion: 'admin'
    },
    {
      id: 3,
      denominacion: 'Sección de Penalidades',
      fechaVigenciaDesde: '2023-01-01',
      fechaVigenciaHasta: '2023-12-31',
      estado: EstadoClausula.NO_VIGENTE,
      versionada: true,
      version: 1,
      capitulos: [],
      clausulas: [
        {
          clausulaId: 4,
          orden: 1,
          denominacion: 'Cláusula de penalidades',
          version: 2
        }
      ],
      fechaCreacion: '2023-01-01',
      usuarioCreacion: 'admin',
      fechaModificacion: null,
      usuarioModificacion: null
    },
    {
      id: 4,
      denominacion: 'Sección de Modificaciones al Contrato',
      fechaVigenciaDesde: null,
      fechaVigenciaHasta: null,
      estado: EstadoClausula.BORRADOR,
      versionada: false,
      version: 1,
      capitulos: [],
      clausulas: [],
      fechaCreacion: '2024-11-20',
      usuarioCreacion: 'admin',
      fechaModificacion: null,
      usuarioModificacion: null
    }
  ];

  constructor() {}

  buscarSecciones(filtro: FiltroSeccion): Observable<Seccion[]> {
    let resultados = [...this.seccionesMock];

    if (filtro.denominacion) {
      const denominacionLower = filtro.denominacion.toLowerCase();
      resultados = resultados.filter(s =>
        s.denominacion.toLowerCase().includes(denominacionLower)
      );
    }

    if (filtro.fechaVigenciaDesde) {
      resultados = resultados.filter(s =>
        s.fechaVigenciaDesde && filtro.fechaVigenciaDesde && s.fechaVigenciaDesde >= filtro.fechaVigenciaDesde
      );
    }

    if (filtro.fechaVigenciaHasta) {
      resultados = resultados.filter(s =>
        !s.fechaVigenciaHasta || (filtro.fechaVigenciaHasta && s.fechaVigenciaHasta <= filtro.fechaVigenciaHasta)
      );
    }

    return of(resultados).pipe(delay(300));
  }

  obtenerSeccion(id: number): Observable<Seccion | undefined> {
    const seccion = this.seccionesMock.find(s => s.id === id);
    return of(seccion).pipe(delay(200));
  }

  obtenerSeccionPorId(id: number): Observable<Seccion | undefined> {
    const seccion = this.seccionesMock.find(s => s.id === id);
    return of(seccion).pipe(delay(200));
  }

  crearSeccion(seccion: Seccion): Observable<Seccion> {
    const nuevoId = Math.max(...this.seccionesMock.map(s => s.id || 0)) + 1;
    const nuevaSeccion = {
      ...seccion,
      id: nuevoId,
      estado: EstadoClausula.BORRADOR,
      version: 1,
      versionada: false,
      fechaCreacion: new Date().toISOString().split('T')[0],
      usuarioCreacion: 'usuario_actual',
      fechaModificacion: null,
      usuarioModificacion: null
    };
    this.seccionesMock.push(nuevaSeccion);
    return of(nuevaSeccion).pipe(delay(300));
  }

  actualizarSeccion(id: number, seccion: Seccion): Observable<Seccion> {
    const index = this.seccionesMock.findIndex(s => s.id === id);
    if (index !== -1) {
      const seccionActualizada = {
        ...seccion,
        id,
        fechaModificacion: new Date().toISOString().split('T')[0],
        usuarioModificacion: 'usuario_actual'
      };
      this.seccionesMock[index] = seccionActualizada;
      return of(seccionActualizada).pipe(delay(300));
    }
    return of(seccion).pipe(delay(300));
  }

  aprobarSeccion(id: number): Observable<Seccion> {
    const index = this.seccionesMock.findIndex(s => s.id === id);
    if (index !== -1) {
      const seccionActual = this.seccionesMock[index];

      const versionAprobada = {
        ...seccionActual,
        estado: EstadoClausula.VIGENTE,
        versionada: true,
        version: (seccionActual.version || 1),
        fechaModificacion: new Date().toISOString().split('T')[0],
        usuarioModificacion: 'usuario_actual'
      };
      this.seccionesMock[index] = versionAprobada;

      const nuevoId = Math.max(...this.seccionesMock.map(s => s.id || 0)) + 1;
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
      this.seccionesMock.push(versionEditable);

      return of(versionAprobada).pipe(delay(300));
    }
    throw new Error('Sección no encontrada');
  }

  guardarSeccion(seccion: Seccion): Observable<Seccion> {
    if (seccion.id) {
      return this.actualizarSeccion(seccion.id, seccion);
    } else {
      return this.crearSeccion(seccion);
    }
  }

  eliminarSeccion(id: number): Observable<EliminarSeccionResponse> {
    const seccion = this.seccionesMock.find(s => s.id === id);

    if (!seccion) {
      const response: EliminarSeccionResponse = {
        exitoso: false,
        mensaje: 'No se encontró la sección especificada.',
        tipoEliminacion: 'FISICA'
      };
      return of(response).pipe(delay(300));
    }

    const tieneVersionEditable = seccion.estado === EstadoClausula.BORRADOR;

    if (tieneVersionEditable) {
      return this.eliminarVersionEditable(id);
    } else {
      return this.eliminarVersionAprobada(id);
    }
  }

  private eliminarVersionEditable(id: number): Observable<EliminarSeccionResponse> {
    const index = this.seccionesMock.findIndex(s => s.id === id);

    if (index !== -1) {
      this.seccionesMock.splice(index, 1);
      const response: EliminarSeccionResponse = {
        exitoso: true,
        mensaje: 'Se eliminó la versión editable y se restauró la versión anteriormente aprobada.',
        tipoEliminacion: 'VERSION_EDITABLE'
      };
      return of(response).pipe(delay(300));
    }

    const response: EliminarSeccionResponse = {
      exitoso: false,
      mensaje: 'No se pudo eliminar la versión editable.',
      tipoEliminacion: 'VERSION_EDITABLE'
    };
    return of(response).pipe(delay(300));
  }

  private eliminarVersionAprobada(id: number): Observable<EliminarSeccionResponse> {
    const index = this.seccionesMock.findIndex(s => s.id === id);
    if (index !== -1) {
      this.seccionesMock.splice(index, 1);
    }

    const response: EliminarSeccionResponse = {
      exitoso: true,
      mensaje: 'La sección se eliminó completamente (baja física).',
      tipoEliminacion: 'FISICA'
    };
    return of(response).pipe(delay(300));
  }

  obtenerHistorialVersiones(seccionId: number): Observable<Seccion[]> {
    const historialMock: Seccion[] = [
      {
        id: 101,
        denominacion: 'Sección de Condiciones Generales del Contrato',
        fechaVigenciaDesde: '2024-01-01',
        fechaVigenciaHasta: '2025-12-31',
        estado: EstadoClausula.VIGENTE,
        versionada: true,
        version: 3,
        capitulos: [],
        clausulas: [],
        fechaCreacion: '2024-10-15',
        usuarioCreacion: 'admin',
        fechaModificacion: '2024-10-15',
        usuarioModificacion: 'admin'
      },
      {
        id: 102,
        denominacion: 'Sección de Condiciones Generales del Contrato',
        fechaVigenciaDesde: '2023-06-01',
        fechaVigenciaHasta: '2024-12-31',
        estado: EstadoClausula.NO_VIGENTE,
        versionada: true,
        version: 2,
        capitulos: [],
        clausulas: [],
        fechaCreacion: '2023-06-01',
        usuarioCreacion: 'admin',
        fechaModificacion: '2023-06-01',
        usuarioModificacion: 'admin'
      }
    ];

    return of(historialMock).pipe(delay(300));
  }
}
