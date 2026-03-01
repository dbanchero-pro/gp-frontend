import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { SeccionDTO } from 'src/app/shared/models/pliego/seccion/seccion.model';
import { EstadoElemento } from 'src/app/shared/enum/estado-elemento.enum';
import { FiltroSeccion } from '../models/filtros/filtro-seccion.model';
import { EliminarElementoResponseDTO } from '../models/eliminar-elemento-response.model';
import { CapituloDTO } from 'src/app/shared/models/pliego/capitulo/capitulo.model';
import { ClausulaDTO } from 'src/app/shared/models/pliego/clausula/clausula.model';
import { CapituloClausulaDTO } from 'src/app/shared/models/pliego/capitulo/capitulo-clausula.model';

const crearClausulaMock = (
    id: number,
    denominacion: string,
    obligatoria: boolean,
    editable: boolean,
    version: number,
    estado: EstadoElemento = EstadoElemento.VIGENTE,
): ClausulaDTO => ({
    id,
    denominacion,
    obligatoria,
    editable,
    tiposCompra: [],
    objetosCompra: [],
    estado,
    redacciones: [],
    version,
});

const crearCapituloMock = (
    id: number,
    denominacion: string,
    version: number,
    clausulas: CapituloClausulaDTO[],
    estado: EstadoElemento = EstadoElemento.VIGENTE,
): CapituloDTO => ({
    id,
    denominacion,
    clausulas,
    estado,
    version,
});

@Injectable({
    providedIn: 'root',
})
export class SeccionService {
    private seccionesMock: SeccionDTO[] = [
        {
            id: 1,
            denominacion: 'Sección de Condiciones Generales del Contrato',
            fechaVigenciaDesde: '2024-01-01',
            fechaVigenciaHasta: '2025-12-31',
            estado: EstadoElemento.VIGENTE,
            version: 1,
            capitulos: [
                {
                    id: 1,
                    orden: 1,
                    capitulo: crearCapituloMock(
                        1,
                        'Capítulo de Condiciones Generales',
                        1,
                        [
                            {
                                Id: 1,
                                orden: 1,
                                clausula: crearClausulaMock(
                                    1,
                                    'Cláusula de garantía de cumplimiento',
                                    true,
                                    true,
                                    1,
                                ),
                            },
                            {
                                Id: 2,
                                orden: 2,
                                clausula: crearClausulaMock(
                                    2,
                                    'Cláusula de plazo de entrega',
                                    true,
                                    true,
                                    1,
                                ),
                            },
                        ],
                    ),
                },
                {
                    id: 2,
                    orden: 2,
                    capitulo: crearCapituloMock(
                        2,
                        'Capítulo de Requisitos Técnicos',
                        2,
                        [
                            {
                                Id: 3,
                                orden: 1,
                                clausula: crearClausulaMock(
                                    3,
                                    'Cláusula de calidad y especificaciones técnicas',
                                    true,
                                    true,
                                    1,
                                ),
                            },
                        ],
                    ),
                },
            ],
            clausulas: [],
            fechaCreacion: '2024-01-01',
            usuarioCreacion: 'admin',
            fechaModificacion: null,
            usuarioModificacion: null,
        },
        {
            id: 2,
            denominacion: 'Sección de Obligaciones y Responsabilidades',
            fechaVigenciaDesde: '2024-03-01',
            fechaVigenciaHasta: null,
            estado: EstadoElemento.VIGENTE,
            version: 1,
            capitulos: [
                {
                    id: 3,
                    orden: 1,
                    capitulo: crearCapituloMock(3, 'Capítulo de Garantías', 1, [
                        {
                            Id: 1,
                            orden: 1,
                            clausula: crearClausulaMock(
                                1,
                                'Cláusula de garantía de cumplimiento',
                                true,
                                true,
                                1,
                            ),
                        },
                    ]),
                },
            ],
            clausulas: [],
            fechaCreacion: '2024-03-01',
            usuarioCreacion: 'admin',
            fechaModificacion: '2024-03-15',
            usuarioModificacion: 'admin',
        },
        {
            id: 3,
            denominacion: 'Sección de Penalidades',
            fechaVigenciaDesde: '2023-01-01',
            fechaVigenciaHasta: '2023-12-31',
            estado: EstadoElemento.NO_VIGENTE,
            version: 1,
            capitulos: [],
            clausulas: [
                {
                    id: 1,
                    orden: 1,
                    clausula: crearClausulaMock(
                        4,
                        'Cláusula de penalidades',
                        true,
                        true,
                        2,
                        EstadoElemento.NO_VIGENTE,
                    ),
                },
            ],
            fechaCreacion: '2023-01-01',
            usuarioCreacion: 'admin',
            fechaModificacion: null,
            usuarioModificacion: null,
        },
        {
            id: 4,
            denominacion: 'Sección de Modificaciones al Contrato',
            fechaVigenciaDesde: '2024-01-01',
            fechaVigenciaHasta: null,
            estado: EstadoElemento.BORRADOR,
            version: 1,
            capitulos: [],
            clausulas: [],
            fechaCreacion: '2024-11-20',
            usuarioCreacion: 'admin',
            fechaModificacion: null,
            usuarioModificacion: null,
        },
    ];

    constructor() {}

    buscarSecciones(filtro: FiltroSeccion): Observable<SeccionDTO[]> {
        let resultados = [...this.seccionesMock];

        if (filtro.denominacion) {
            const denominacionLower = filtro.denominacion.toLowerCase();
            resultados = resultados.filter((s) =>
                s.denominacion.toLowerCase().includes(denominacionLower),
            );
        }

        if (filtro.fechaVigenciaDesde) {
            resultados = resultados.filter(
                (s) =>
                    s.fechaVigenciaDesde &&
                    filtro.fechaVigenciaDesde &&
                    s.fechaVigenciaDesde >= filtro.fechaVigenciaDesde,
            );
        }

        if (filtro.fechaVigenciaHasta) {
            resultados = resultados.filter(
                (s) =>
                    !s.fechaVigenciaHasta ||
                    (filtro.fechaVigenciaHasta &&
                        s.fechaVigenciaHasta <= filtro.fechaVigenciaHasta),
            );
        }

        return of(resultados).pipe(delay(300));
    }

    obtenerSeccion(id: number): Observable<SeccionDTO | undefined> {
        const seccion = this.seccionesMock.find((s) => s.id === id);
        return of(seccion).pipe(delay(200));
    }

    obtenerSeccionPorId(id: number): Observable<SeccionDTO | undefined> {
        const seccion = this.seccionesMock.find((s) => s.id === id);
        return of(seccion).pipe(delay(200));
    }

    crearSeccion(seccion: SeccionDTO): Observable<SeccionDTO> {
        const nuevoId =
            Math.max(...this.seccionesMock.map((s) => s.id || 0)) + 1;
        const nuevaSeccion = {
            ...seccion,
            id: nuevoId,
            estado: EstadoElemento.BORRADOR,
            version: 1,

            fechaCreacion: new Date().toISOString().split('T')[0],
            usuarioCreacion: 'usuario_actual',
            fechaModificacion: null,
            usuarioModificacion: null,
        };
        this.seccionesMock.push(nuevaSeccion);
        return of(nuevaSeccion).pipe(delay(300));
    }

    actualizarSeccion(id: number, seccion: SeccionDTO): Observable<SeccionDTO> {
        const index = this.seccionesMock.findIndex((s) => s.id === id);
        if (index !== -1) {
            const seccionActualizada = {
                ...seccion,
                id,
                fechaModificacion: new Date().toISOString().split('T')[0],
                usuarioModificacion: 'usuario_actual',
            };
            this.seccionesMock[index] = seccionActualizada;
            return of(seccionActualizada).pipe(delay(300));
        }
        return of(seccion).pipe(delay(300));
    }

    aprobarSeccion(id: number): Observable<SeccionDTO> {
        const index = this.seccionesMock.findIndex((s) => s.id === id);
        if (index !== -1) {
            const seccionActual = this.seccionesMock[index];

            const versionAprobada = {
                ...seccionActual,
                estado: EstadoElemento.VIGENTE,

                version: seccionActual.version || 1,
                fechaModificacion: new Date().toISOString().split('T')[0],
                usuarioModificacion: 'usuario_actual',
            };
            this.seccionesMock[index] = versionAprobada;

            const nuevoId =
                Math.max(...this.seccionesMock.map((s) => s.id || 0)) + 1;
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
                usuarioModificacion: null,
            };
            this.seccionesMock.push(versionEditable);

            return of(versionAprobada).pipe(delay(300));
        }
        throw new Error('Sección no encontrada');
    }

    guardarSeccion(seccion: SeccionDTO): Observable<SeccionDTO> {
        if (seccion.id) {
            return this.actualizarSeccion(seccion.id, seccion);
        } else {
            return this.crearSeccion(seccion);
        }
    }

    eliminarSeccion(id: number): Observable<EliminarElementoResponseDTO> {
        const seccion = this.seccionesMock.find((s) => s.id === id);

        if (!seccion) {
            const response: EliminarElementoResponseDTO = {
                exitoso: false,
                mensaje: 'No se encontró la sección especificada.',
                tipoEliminacion: 'FISICA',
            };
            return of(response).pipe(delay(300));
        }

        const tieneVersionEditable = seccion.estado === EstadoElemento.BORRADOR;

        if (tieneVersionEditable) {
            return this.eliminarVersionEditable(id);
        } else {
            return this.eliminarVersionAprobada(id);
        }
    }

    private eliminarVersionEditable(
        id: number,
    ): Observable<EliminarElementoResponseDTO> {
        const index = this.seccionesMock.findIndex((s) => s.id === id);

        if (index !== -1) {
            this.seccionesMock.splice(index, 1);
            const response: EliminarElementoResponseDTO = {
                exitoso: true,
                mensaje:
                    'Se eliminó la versión editable y se restauró la versión anteriormente aprobada.',
                tipoEliminacion: 'VERSION_EDITABLE',
            };
            return of(response).pipe(delay(300));
        }

        const response: EliminarElementoResponseDTO = {
            exitoso: false,
            mensaje: 'No se pudo eliminar la versión editable.',
            tipoEliminacion: 'VERSION_EDITABLE',
        };
        return of(response).pipe(delay(300));
    }

    private eliminarVersionAprobada(
        id: number,
    ): Observable<EliminarElementoResponseDTO> {
        const index = this.seccionesMock.findIndex((s) => s.id === id);
        if (index !== -1) {
            this.seccionesMock.splice(index, 1);
        }

        const response: EliminarElementoResponseDTO = {
            exitoso: true,
            mensaje: 'La sección se eliminó completamente (baja física).',
            tipoEliminacion: 'FISICA',
        };
        return of(response).pipe(delay(300));
    }

    obtenerHistorialVersiones(seccionId: number): Observable<SeccionDTO[]> {
        const historialMock: SeccionDTO[] = [
            {
                id: 101,
                denominacion: 'Sección de Condiciones Generales del Contrato',
                fechaVigenciaDesde: '2024-01-01',
                fechaVigenciaHasta: '2025-12-31',
                estado: EstadoElemento.VIGENTE,

                version: 3,
                capitulos: [],
                clausulas: [],
                fechaCreacion: '2024-10-15',
                usuarioCreacion: 'admin',
                fechaModificacion: '2024-10-15',
                usuarioModificacion: 'admin',
            },
            {
                id: 102,
                denominacion: 'Sección de Condiciones Generales del Contrato',
                fechaVigenciaDesde: '2023-06-01',
                fechaVigenciaHasta: '2024-12-31',
                estado: EstadoElemento.NO_VIGENTE,

                version: 2,
                capitulos: [],
                clausulas: [],
                fechaCreacion: '2023-06-01',
                usuarioCreacion: 'admin',
                fechaModificacion: '2023-06-01',
                usuarioModificacion: 'admin',
            },
        ];

        return of(historialMock).pipe(delay(300));
    }
}
