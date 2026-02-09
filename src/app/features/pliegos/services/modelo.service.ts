import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Modelo } from '../models/modelo.model';
import { FiltroModelo } from '../models/filtro-modelo.model';
import { EliminarModeloResponse } from '../models/eliminar-modelo-response.model';

@Injectable({
  providedIn: 'root'
})
export class ModeloService {

  private modelos: Modelo[] = [
    {
      id: 1,
      denominacion: 'Modelo de Licitación Pública Nacional',
      fechaVigenciaDesde: '2024-01-01',
      fechaVigenciaHasta: '2025-12-31',
      estado: 'ACTIVO',
      versionada: true,
      version: 1,
      secciones: [
        {
          seccionId: 1,
          orden: 1,
          denominacion: 'Condiciones Generales',
          version: 1,
          capitulos: [
            {
              capituloId: 1,
              orden: 1,
              denominacion: 'Objeto del llamado',
              version: 1,
              clausulas: [
                {
                  clausulaId: 1,
                  orden: 1,
                  denominacion: 'Objeto de la licitación',
                  version: 1,
                  redacciones: [
                    {
                      redaccionId: 1,
                      prioridad: 1,
                      redaccion: 'La presente licitación tiene por objeto la adquisición de bienes y servicios según lo establecido en el pliego de condiciones.'
                    }
                  ]
                }
              ]
            }
          ],
          clausulas: []
        }
      ],
      clausulas: [],
      tiposCompra: [
        {
          tipoCompraId: 1,
          descripcion: 'Licitación Pública',
          subtipos: [
            { subtipoCompraId: 1, descripcion: 'Nacional' }
          ]
        }
      ],
      organismos: [
        {
          incisoId: 1,
          incisoDescripcion: '02 - Presidencia de la República',
          unidadEjecutoraId: 1,
          unidadEjecutoraDescripcion: '001 - Unidad Central'
        }
      ],
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
      estado: 'ACTIVO',
      versionada: true,
      version: 2,
      secciones: [],
      clausulas: [
        {
          clausulaId: 10,
          orden: 1,
          denominacion: 'Plazo de entrega',
          version: 1,
          redacciones: [
            {
              redaccionId: 10,
              prioridad: 1,
              redaccion: 'El proveedor deberá entregar los bienes o servicios en un plazo máximo de 30 días corridos desde la firma del contrato.'
            }
          ]
        }
      ],
      tiposCompra: [
        {
          tipoCompraId: 2,
          descripcion: 'Contratación Directa',
          subtipos: [
            { subtipoCompraId: 3, descripcion: 'Por monto' }
          ]
        }
      ],
      organismos: [
        {
          incisoId: 2,
          incisoDescripcion: '04 - Ministerio de Economía y Finanzas',
          unidadEjecutoraId: 5,
          unidadEjecutoraDescripcion: '002 - Dirección General'
        }
      ],
      fechaCreacion: '2024-05-15',
      usuarioCreacion: 'admin',
      fechaModificacion: '2024-06-01',
      usuarioModificacion: 'admin'
    },
    {
      id: 3,
      denominacion: 'Modelo Borrador - Obras Públicas',
      fechaVigenciaDesde: '2025-01-01',
      fechaVigenciaHasta: '2025-12-31',
      estado: 'BORRADOR',
      versionada: false,
      version: 1,
      secciones: [],
      clausulas: [],
      tiposCompra: [],
      organismos: [],
      fechaCreacion: '2024-12-01',
      usuarioCreacion: 'user1',
      fechaModificacion: null,
      usuarioModificacion: null
    }
  ];

  private contadorId = 4;

  buscarModelos(filtro: FiltroModelo): Observable<Modelo[]> {
    let resultado = [...this.modelos];

    if (filtro.incisoId) {
      resultado = resultado.filter(m =>
        m.organismos.some(o => o.incisoId === filtro.incisoId)
      );
    }

    if (filtro.unidadEjecutoraId) {
      resultado = resultado.filter(m =>
        m.organismos.some(o => o.unidadEjecutoraId === filtro.unidadEjecutoraId)
      );
    }

    if (filtro.tipoCompraId) {
      resultado = resultado.filter(m =>
        m.tiposCompra.some(tc => tc.tipoCompraId === filtro.tipoCompraId)
      );
    }

    if (filtro.subtipoCompraId) {
      resultado = resultado.filter(m =>
        m.tiposCompra.some(tc =>
          tc.subtipos.some(st => st.subtipoCompraId === filtro.subtipoCompraId)
        )
      );
    }

    if (filtro.denominacion) {
      const busqueda = filtro.denominacion.toLowerCase();
      resultado = resultado.filter(m =>
        m.denominacion.toLowerCase().includes(busqueda)
      );
    }

    if (filtro.fechaVigenciaDesde) {
      resultado = resultado.filter(m =>
        m.fechaVigenciaDesde && m.fechaVigenciaDesde >= filtro.fechaVigenciaDesde!
      );
    }

    if (filtro.fechaVigenciaHasta) {
      resultado = resultado.filter(m =>
        !m.fechaVigenciaHasta || m.fechaVigenciaHasta <= filtro.fechaVigenciaHasta!
      );
    }

    resultado.sort((a, b) => a.denominacion.localeCompare(b.denominacion));

    return of(resultado).pipe(delay(300));
  }

  obtenerModeloPorId(id: number): Observable<Modelo | undefined> {
    const modelo = this.modelos.find(m => m.id === id);
    return of(modelo).pipe(delay(200));
  }

  crearModelo(modelo: Modelo): Observable<Modelo> {
    const nuevoModelo: Modelo = {
      ...modelo,
      id: this.contadorId++,
      fechaCreacion: new Date().toISOString(),
      usuarioCreacion: 'usuario_actual',
      fechaModificacion: null,
      usuarioModificacion: null
    };

    this.modelos.push(nuevoModelo);
    return of(nuevoModelo).pipe(delay(300));
  }

  actualizarModelo(id: number, modelo: Modelo): Observable<Modelo> {
    const index = this.modelos.findIndex(m => m.id === id);

    if (index === -1) {
      return throwError(() => new Error('Modelo no encontrado'));
    }

    const modeloActualizado: Modelo = {
      ...modelo,
      id: id,
      fechaModificacion: new Date().toISOString(),
      usuarioModificacion: 'usuario_actual'
    };

    this.modelos[index] = modeloActualizado;
    return of(modeloActualizado).pipe(delay(300));
  }

  eliminarModelo(id: number): Observable<EliminarModeloResponse> {
    const index = this.modelos.findIndex(m => m.id === id);

    if (index === -1) {
      return of({
        exitoso: false,
        mensaje: 'Modelo no encontrado'
      }).pipe(delay(200));
    }

    const modelo = this.modelos[index];

    if (modelo.estado !== 'BORRADOR') {
      return of({
        exitoso: false,
        mensaje: 'Solo se pueden eliminar modelos en estado borrador'
      }).pipe(delay(200));
    }

    this.modelos.splice(index, 1);

    return of({
      exitoso: true,
      mensaje: 'Modelo eliminado exitosamente'
    }).pipe(delay(300));
  }

  aprobarModelo(id: number): Observable<Modelo> {
    const index = this.modelos.findIndex(m => m.id === id);

    if (index === -1) {
      return throwError(() => new Error('Modelo no encontrado'));
    }

    const modelo = this.modelos[index];

    if (modelo.estado !== 'BORRADOR') {
      return throwError(() => new Error('El modelo ya está aprobado'));
    }

    modelo.estado = 'ACTIVO';
    modelo.versionada = true;
    modelo.fechaModificacion = new Date().toISOString();
    modelo.usuarioModificacion = 'usuario_actual';

    return of(modelo).pipe(delay(300));
  }
}
