import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { CapituloDTO } from 'src/app/shared/models/pliego/capitulo/capitulo.model';
import { EstadoElemento } from 'src/app/shared/enum/estado-elemento.enum';
import { FiltroCapitulo } from '../models/filtros/filtro-capitulo.model';
import { EliminarElementoResponseDTO } from '../models/eliminar-elemento-response.model';
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

@Injectable({
    providedIn: 'root',
})
export class CapituloService {
    private capitulosMock: CapituloDTO[] = [
        {
            id: 1,
            denominacion: 'Capítulo de Condiciones Generales',
            fechaVigenciaDesde: '2024-01-01',
            fechaVigenciaHasta: '2025-12-31',
            estado: EstadoElemento.VIGENTE,
            version: 1,
            clausulas: [
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
                {
                    Id: 4,
                    orden: 3,
                    clausula: crearClausulaMock(
                        4,
                        'Cláusula de penalidades',
                        true,
                        true,
                        2,
                    ),
                },
            ],
            fechaCreacion: '2024-01-01',
            usuarioCreacion: 'admin',
            fechaModificacion: null,
            usuarioModificacion: null,
        },
        {
            id: 2,
            denominacion: 'Capítulo de Requisitos Técnicos',
            fechaVigenciaDesde: '2024-03-01',
            fechaVigenciaHasta: null,
            estado: EstadoElemento.VIGENTE,
            version: 2,
            clausulas: [
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
            fechaCreacion: '2024-03-01',
            usuarioCreacion: 'admin',
            fechaModificacion: '2024-03-15',
            usuarioModificacion: 'admin',
        },
        {
            id: 3,
            denominacion: 'Capítulo de Garantías',
            fechaVigenciaDesde: '2023-01-01',
            fechaVigenciaHasta: '2023-12-31',
            estado: EstadoElemento.NO_VIGENTE,
            version: 1,
            clausulas: [
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
            ],
            fechaCreacion: '2023-01-01',
            usuarioCreacion: 'admin',
            fechaModificacion: null,
            usuarioModificacion: null,
        },
        {
            id: 4,
            denominacion: 'Capítulo de Entrega y Recepción',
            fechaVigenciaDesde: '2024-06-01',
            fechaVigenciaHasta: '2025-06-30',
            estado: EstadoElemento.VIGENTE,
            version: 1,
            clausulas: [
                {
                    Id: 2,
                    orden: 1,
                    clausula: crearClausulaMock(
                        2,
                        'Cláusula de plazo de entrega',
                        true,
                        true,
                        1,
                    ),
                },
                {
                    Id: 3,
                    orden: 2,
                    clausula: crearClausulaMock(
                        3,
                        'Cláusula de calidad y especificaciones técnicas',
                        true,
                        true,
                        1,
                    ),
                },
            ],
            fechaCreacion: '2024-06-01',
            usuarioCreacion: 'admin',
            fechaModificacion: null,
            usuarioModificacion: null,
        },
        {
            id: 5,
            denominacion: 'Capítulo de Modificaciones al Contrato',
            fechaVigenciaDesde: '2024-01-01',
            fechaVigenciaHasta: null,
            estado: EstadoElemento.BORRADOR,
            version: 1,
            clausulas: [],
            fechaCreacion: '2024-11-20',
            usuarioCreacion: 'admin',
            fechaModificacion: null,
            usuarioModificacion: null,
        },
    ];

    constructor() {}

    buscarCapitulos(filtro: FiltroCapitulo): Observable<CapituloDTO[]> {
        let resultados = [...this.capitulosMock];

        if (filtro.denominacion) {
            const denominacionLower = filtro.denominacion.toLowerCase();
            resultados = resultados.filter((c) =>
                c.denominacion.toLowerCase().includes(denominacionLower),
            );
        }

        if (filtro.fechaVigenciaDesde) {
            resultados = resultados.filter(
                (c) =>
                    c.fechaVigenciaDesde &&
                    filtro.fechaVigenciaDesde &&
                    c.fechaVigenciaDesde >= filtro.fechaVigenciaDesde,
            );
        }

        if (filtro.fechaVigenciaHasta) {
            resultados = resultados.filter(
                (c) =>
                    !c.fechaVigenciaHasta ||
                    (filtro.fechaVigenciaHasta &&
                        c.fechaVigenciaHasta <= filtro.fechaVigenciaHasta),
            );
        }

        return of(resultados).pipe(delay(300));
    }

    obtenerCapitulo(id: number): Observable<CapituloDTO | undefined> {
        const capitulo = this.capitulosMock.find((c) => c.id === id);
        return of(capitulo).pipe(delay(200));
    }

    obtenerCapituloPorId(id: number): Observable<CapituloDTO | undefined> {
        const capitulo = this.capitulosMock.find((c) => c.id === id);
        return of(capitulo).pipe(delay(200));
    }

    crearCapitulo(capitulo: CapituloDTO): Observable<CapituloDTO> {
        const nuevoId =
            Math.max(...this.capitulosMock.map((c) => c.id || 0)) + 1;
        const nuevoCapitulo = {
            ...capitulo,
            id: nuevoId,
            estado: EstadoElemento.BORRADOR,
            version: 1,

            fechaCreacion: new Date().toISOString().split('T')[0],
            usuarioCreacion: 'usuario_actual',
            fechaModificacion: null,
            usuarioModificacion: null,
        };
        this.capitulosMock.push(nuevoCapitulo);
        return of(nuevoCapitulo).pipe(delay(300));
    }

    actualizarCapitulo(
        id: number,
        capitulo: CapituloDTO,
    ): Observable<CapituloDTO> {
        const index = this.capitulosMock.findIndex((c) => c.id === id);
        if (index !== -1) {
            const capituloActualizado = {
                ...capitulo,
                id,
                fechaModificacion: new Date().toISOString().split('T')[0],
                usuarioModificacion: 'usuario_actual',
            };
            this.capitulosMock[index] = capituloActualizado;
            return of(capituloActualizado).pipe(delay(300));
        }
        return of(capitulo).pipe(delay(300));
    }

    aprobarCapitulo(id: number): Observable<CapituloDTO> {
        const index = this.capitulosMock.findIndex((c) => c.id === id);
        if (index !== -1) {
            const capituloActual = this.capitulosMock[index];

            const versionAprobada = {
                ...capituloActual,
                estado: EstadoElemento.VIGENTE,

                version: capituloActual.version || 1,
                fechaModificacion: new Date().toISOString().split('T')[0],
                usuarioModificacion: 'usuario_actual',
            };
            this.capitulosMock[index] = versionAprobada;

            const nuevoId =
                Math.max(...this.capitulosMock.map((c) => c.id || 0)) + 1;
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
            this.capitulosMock.push(versionEditable);

            return of(versionAprobada).pipe(delay(300));
        }
        throw new Error('Capítulo no encontrado');
    }

    guardarCapitulo(capitulo: CapituloDTO): Observable<CapituloDTO> {
        if (capitulo.id) {
            return this.actualizarCapitulo(capitulo.id, capitulo);
        } else {
            return this.crearCapitulo(capitulo);
        }
    }

    eliminarCapitulo(id: number): Observable<EliminarElementoResponseDTO> {
        const capitulo = this.capitulosMock.find((c) => c.id === id);

        if (!capitulo) {
            const response: EliminarElementoResponseDTO = {
                exitoso: false,
                mensaje: 'No se encontró el capítulo especificado.',
                tipoEliminacion: 'FISICA',
            };
            return of(response).pipe(delay(300));
        }

        const tieneVersionEditable =
            capitulo.estado === EstadoElemento.BORRADOR;

        if (tieneVersionEditable) {
            return this.eliminarVersionEditable(id);
        } else {
            return this.eliminarVersionAprobada(id);
        }
    }

    private eliminarVersionEditable(
        id: number,
    ): Observable<EliminarElementoResponseDTO> {
        const index = this.capitulosMock.findIndex((c) => c.id === id);

        if (index !== -1) {
            this.capitulosMock.splice(index, 1);
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
        const index = this.capitulosMock.findIndex((c) => c.id === id);
        if (index !== -1) {
            this.capitulosMock.splice(index, 1);
        }

        const response: EliminarElementoResponseDTO = {
            exitoso: true,
            mensaje: 'El capítulo se eliminó completamente (baja física).',
            tipoEliminacion: 'FISICA',
        };
        return of(response).pipe(delay(300));
    }

    obtenerHistorialVersiones(capituloId: number): Observable<CapituloDTO[]> {
        const historialMock: CapituloDTO[] = [
            {
                id: 101,
                denominacion: 'Capítulo de Condiciones Generales',
                fechaVigenciaDesde: '2024-01-01',
                fechaVigenciaHasta: '2025-12-31',
                estado: EstadoElemento.VIGENTE,
                version: 3,
                clausulas: [
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
                ],
                fechaCreacion: '2024-10-15',
                usuarioCreacion: 'admin',
                fechaModificacion: '2024-10-15',
                usuarioModificacion: 'admin',
            },
            {
                id: 102,
                denominacion: 'Capítulo de Condiciones Generales',
                fechaVigenciaDesde: '2023-06-01',
                fechaVigenciaHasta: '2024-12-31',
                estado: EstadoElemento.NO_VIGENTE,
                version: 2,
                clausulas: [
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
                ],
                fechaCreacion: '2023-06-01',
                usuarioCreacion: 'admin',
                fechaModificacion: '2023-06-01',
                usuarioModificacion: 'admin',
            },
        ];

        return of(historialMock).pipe(delay(300));
    }
}
