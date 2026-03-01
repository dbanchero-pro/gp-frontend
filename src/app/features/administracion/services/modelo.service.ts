import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ModeloDTO } from 'src/app/shared/models/pliego/modelo/modelo.model';
import { TipoCompraClausulaModeloDTO } from 'src/app/shared/models/pliego/comun/tipo-compra-clausula-modelo.model';
import { OrganismoClausulaModeloDTO } from 'src/app/shared/models/pliego/comun/organismo-clausula-modelo.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { SubtipoCompraDTO } from 'src/app/shared/models/sice/subtipo-compra.model';
import { IncisoDTO } from 'src/app/shared/models/sice/inciso.model';
import { UnidadEjecutoraDTO } from 'src/app/shared/models/sice/unidad-ejecutora.model';
import { EstadoElemento } from 'src/app/shared/enum/estado-elemento.enum';
import { FiltroModelo } from '../models/filtros/filtro-modelo.model';
import { EliminarElementoResponseDTO } from '../models/eliminar-elemento-response.model';
import { ModeloSeccionDTO } from 'src/app/shared/models/pliego/modelo/modelo-seccion.model';

const crearTipoCompraMock = (
    id: string,
    descripcion: string,
    subtipoId?: string,
    subtipoDescripcion?: string,
): TipoCompraClausulaModeloDTO => ({
    tipoCompra: new TipoCompraDTO(id, descripcion),
    subtipoCompra: subtipoId
        ? new SubtipoCompraDTO(id, subtipoId, subtipoDescripcion, descripcion)
        : undefined,
});

const crearOrganismoMock = (
    incisoId: number,
    incisoDesc: string,
    unidadEjecutoraId?: number,
    unidadEjecutoraDesc?: string,
): OrganismoClausulaModeloDTO => ({
    inciso: new IncisoDTO(incisoId, incisoDesc),
    unidadEjecutora: unidadEjecutoraId
        ? new UnidadEjecutoraDTO(
              unidadEjecutoraId,
              new IncisoDTO(incisoId, incisoDesc),
              unidadEjecutoraId,
              unidadEjecutoraDesc,
          )
        : undefined,
});

const crearSeccionesModeloMock = (idModelo: number): ModeloSeccionDTO[] => [
    {
        id: idModelo * 1000 + 1,
        orden: 1,
        seccion: {
            id: idModelo * 100 + 1,
            denominacion: `Seccion base ${idModelo}`,
            capitulos: [],
            clausulas: [],
            estado: EstadoElemento.VIGENTE,
        },
    },
];

@Injectable({
    providedIn: 'root',
})
export class ModeloService {
    private modelos: ModeloDTO[] = [
        {
            id: 1,
            denominacion: 'Modelo de Licitación Pública Nacional',
            fechaVigenciaDesde: '2024-01-01',
            fechaVigenciaHasta: '2025-12-31',
            estado: EstadoElemento.VIGENTE,
            version: 1,
            secciones: crearSeccionesModeloMock(1),
            tiposCompra: [
                crearTipoCompraMock(
                    'LP',
                    'Licitación Pública',
                    'NAC',
                    'Nacional',
                ),
            ],
            organismo: crearOrganismoMock(
                1,
                'Presidencia de la República',
                1,
                'Unidad Central',
            ),
            fechaCreacion: '2024-01-01',
            usuarioCreacion: 'admin',
            fechaModificacion: null,
            usuarioModificacion: null,
        },
        {
            id: 2,
            denominacion: 'Modelo de Contratación Directa',
            fechaVigenciaDesde: '2024-06-01',
            fechaVigenciaHasta: null,
            estado: EstadoElemento.VIGENTE,
            version: 2,
            secciones: crearSeccionesModeloMock(2),
            tiposCompra: [
                crearTipoCompraMock(
                    'CD',
                    'Contratación Directa',
                    'MON',
                    'Por monto',
                ),
            ],
            organismo: crearOrganismoMock(
                2,
                'Ministerio de Economía y Finanzas',
                5,
                'Dirección General',
            ),
            fechaCreacion: '2024-05-15',
            usuarioCreacion: 'admin',
            fechaModificacion: '2024-06-01',
            usuarioModificacion: 'admin',
        },
        {
            id: 3,
            denominacion: 'Modelo Borrador - Obras Públicas',
            fechaVigenciaDesde: '2025-01-01',
            fechaVigenciaHasta: '2025-12-31',
            estado: EstadoElemento.BORRADOR,
            version: 1,
            secciones: crearSeccionesModeloMock(3),
            tiposCompra: [crearTipoCompraMock('LA', 'Licitación Abreviada')],
            organismo: undefined,
            fechaCreacion: '2024-12-01',
            usuarioCreacion: 'user1',
            fechaModificacion: null,
            usuarioModificacion: null,
        },
    ];

    private contadorId = 4;

    buscarModelos(filtro: FiltroModelo): Observable<ModeloDTO[]> {
        let resultado = [...this.modelos];

        if (filtro.incisoId) {
            resultado = resultado.filter(
                (m) => m.organismo?.inciso?.id === filtro.incisoId,
            );
        }

        if (filtro.unidadEjecutoraId) {
            resultado = resultado.filter(
                (m) =>
                    m.organismo?.unidadEjecutora?.id ===
                    filtro.unidadEjecutoraId,
            );
        }

        if (filtro.tipoCompraId) {
            resultado = resultado.filter((m) =>
                m.tiposCompra.some(
                    (tc) => tc.tipoCompra?.id === filtro.tipoCompraId,
                ),
            );
        }

        if (filtro.subtipoCompraId) {
            resultado = resultado.filter((m) =>
                m.tiposCompra.some(
                    (tc) =>
                        tc.subtipoCompra?.idSubtipoCompra ===
                        filtro.subtipoCompraId,
                ),
            );
        }

        if (filtro.denominacion) {
            const busqueda = filtro.denominacion.toLowerCase();
            resultado = resultado.filter((m) =>
                m.denominacion.toLowerCase().includes(busqueda),
            );
        }

        if (filtro.fechaVigenciaDesde) {
            resultado = resultado.filter(
                (m) =>
                    m.fechaVigenciaDesde &&
                    m.fechaVigenciaDesde >= filtro.fechaVigenciaDesde!,
            );
        }

        if (filtro.fechaVigenciaHasta) {
            resultado = resultado.filter(
                (m) =>
                    !m.fechaVigenciaHasta ||
                    m.fechaVigenciaHasta <= filtro.fechaVigenciaHasta!,
            );
        }

        resultado.sort((a, b) => a.denominacion.localeCompare(b.denominacion));

        return of(resultado).pipe(delay(300));
    }

    obtenerModeloPorId(id: number): Observable<ModeloDTO | undefined> {
        const modelo = this.modelos.find((m) => m.id === id);
        return of(modelo).pipe(delay(200));
    }

    crearModelo(modelo: ModeloDTO): Observable<ModeloDTO> {
        const nuevoModelo: ModeloDTO = {
            ...modelo,
            id: this.contadorId++,
            fechaCreacion: new Date().toISOString(),
            usuarioCreacion: 'usuario_actual',
            fechaModificacion: null,
            usuarioModificacion: null,
        };

        this.modelos.push(nuevoModelo);
        return of(nuevoModelo).pipe(delay(300));
    }

    actualizarModelo(id: number, modelo: ModeloDTO): Observable<ModeloDTO> {
        const index = this.modelos.findIndex((m) => m.id === id);

        if (index === -1) {
            return throwError(() => new Error('Modelo no encontrado'));
        }

        const modeloActualizado: ModeloDTO = {
            ...modelo,
            id: id,
            fechaModificacion: new Date().toISOString(),
            usuarioModificacion: 'usuario_actual',
        };

        this.modelos[index] = modeloActualizado;
        return of(modeloActualizado).pipe(delay(300));
    }

    eliminarModelo(id: number): Observable<EliminarElementoResponseDTO> {
        const index = this.modelos.findIndex((m) => m.id === id);

        if (index === -1) {
            return of({
                exitoso: false,
                mensaje: 'Modelo no encontrado',
            }).pipe(delay(200));
        }

        const modelo = this.modelos[index];

        if (modelo.estado !== 'BORRADOR') {
            return of({
                exitoso: false,
                mensaje: 'Solo se pueden eliminar modelos en estado borrador',
            }).pipe(delay(200));
        }

        this.modelos.splice(index, 1);

        return of({
            exitoso: true,
            mensaje: 'Modelo eliminado exitosamente',
        }).pipe(delay(300));
    }

    aprobarModelo(id: number): Observable<ModeloDTO> {
        const index = this.modelos.findIndex((m) => m.id === id);

        if (index === -1) {
            return throwError(() => new Error('Modelo no encontrado'));
        }

        const modelo = this.modelos[index];

        if (modelo.estado !== 'BORRADOR') {
            return throwError(() => new Error('El modelo ya está aprobado'));
        }

        modelo.estado = EstadoElemento.VIGENTE;
        modelo.fechaModificacion = new Date().toISOString();
        modelo.usuarioModificacion = 'usuario_actual';

        return of(modelo).pipe(delay(300));
    }
}
