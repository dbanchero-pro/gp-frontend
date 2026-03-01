import { Injectable } from '@angular/core';
import { EstadoElemento } from 'src/app/shared/enum/estado-elemento.enum';
import { SiNoAmbasValor } from 'src/app/shared/enum/si-no-ambas-valor.enum';
import { EstadoPliego } from '../enum/estado-pliego.enum';
import { PliegoDTO } from '../models/pliego.model';
import { SeccionPliegoDTO } from '../models/seccion-pliego.model';
import { TareaHistorialDTO } from '../models/tarea-historial.model';
import { UsuarioAsignadoPliegoDTO } from '../models/usuario-asignado-pliego.model';

const USUARIOS_ASIGNADOS_MOCK: UsuarioAsignadoPliegoDTO[] = [
    { rol: 'Editor Principal', nombre: 'Juan Pérez' },
    { rol: 'Editor', nombre: 'María González' },
    { rol: 'Validador', nombre: 'Carlos Rodríguez' },
];

const HISTORIAL_TAREAS_MOCK: TareaHistorialDTO[] = [
    {
        fecha: new Date('2024-01-15 10:30'),
        tarea: 'Creación',
        usuario: 'Juan Pérez',
    },
    {
        fecha: new Date('2024-02-16 14:20'),
        tarea: 'Asignación',
        usuario: 'María González',
    },
    {
        fecha: new Date('2024-03-16 14:20'),
        tarea: 'Iniciación',
        usuario: 'María González',
    },
    {
        fecha: new Date('2024-03-16 14:20'),
        tarea: 'En edición',
        usuario: 'María González',
    },
];

const SECCIONES_MOCK: SeccionPliegoDTO[] = [
    {
        nombre: 'Sección I - Información General',
        expandida: true,
        capitulos: [
            {
                nombre: 'Capítulo I - Objeto de la Compra',
                expandido: true,
                clausulas: [
                    {
                        id: 1,
                        nombre: 'Descripción del objeto',
                        bloqueada: false,
                        obligatoria: true,
                        editable: true,
                        clausula: {
                            id: 1,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                    {
                        id: 2,
                        nombre: 'Especificaciones técnicas',
                        bloqueada: true,
                        obligatoria: false,
                        editable: false,
                        clausula: {
                            id: 1,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                    {
                        id: 3,
                        nombre: 'Cantidad y unidades',
                        bloqueada: false,
                        obligatoria: true,
                        editable: false,
                        clausula: {
                            id: 1,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                ] as any,
                capitulo: {
                    id: 1,
                    denominacion: '',
                    clausulas: [],
                    estado: EstadoElemento.VIGENTE,
                },
            },
            {
                nombre: 'Capítulo II - Condiciones Generales',
                expandido: false,
                clausulas: [
                    {
                        id: 4,
                        nombre: 'Plazo de entrega',
                        bloqueada: false,
                        obligatoria: true,
                        editable: false,
                        clausula: {
                            id: 1,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                    {
                        id: 5,
                        nombre: 'Lugar de entrega',
                        bloqueada: false,
                        obligatoria: true,
                        editable: false,
                        clausula: {
                            id: 1,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                    {
                        id: 6,
                        nombre: 'Garantías',
                        bloqueada: false,
                        obligatoria: false,
                        editable: false,
                        clausula: {
                            id: 1,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                ] as any,
                capitulo: {
                    id: 1,
                    denominacion: '',
                    clausulas: [],
                    estado: EstadoElemento.VIGENTE,
                },
            },
        ],
        seccion: {
            id: 1,
            denominacion: 'sección 1',
            estado: EstadoElemento.VIGENTE,
            capitulos: [],
            clausulas: [],
        },
        clausulas: [],
        soloClausulas: false,
    },
    {
        nombre: 'Sección II - Requisitos de Participación',
        expandida: false,
        capitulos: [
            {
                nombre: 'Capítulo I - Requisitos Legales',
                expandido: false,
                clausulas: [
                    {
                        id: 7,
                        nombre: 'Documentación legal',
                        bloqueada: false,
                        obligatoria: true,
                        editable: false,
                        clausula: {
                            id: 1,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                    {
                        id: 8,
                        nombre: 'Certificados requeridos',
                        bloqueada: false,
                        obligatoria: true,
                        editable: false,
                        clausula: {
                            id: 1,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                ] as any,
                capitulo: {
                    id: 1,
                    denominacion: '',
                    clausulas: [],
                    estado: EstadoElemento.VIGENTE,
                },
            },
            {
                nombre: 'Capítulo II - Requisitos Técnicos',
                expandido: false,
                clausulas: [
                    {
                        id: 9,
                        nombre: 'Experiencia técnica',
                        bloqueada: false,
                        obligatoria: true,
                        editable: false,
                        clausula: {
                            id: 1,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                    {
                        id: 10,
                        nombre: 'Capacidad operativa',
                        bloqueada: false,
                        obligatoria: false,
                        editable: false,
                        clausula: {
                            id: 1,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                ] as any,
                capitulo: {
                    id: 1,
                    denominacion: '',
                    clausulas: [],
                    estado: EstadoElemento.VIGENTE,
                },
            },
        ],
        seccion: {
            id: 1,
            denominacion: 'sección 1',
            estado: EstadoElemento.VIGENTE,
            capitulos: [],
            clausulas: [],
        },
        clausulas: [],
        soloClausulas: false,
    },
    {
        nombre: 'Sección III - Evaluación y Adjudicación',
        expandida: false,
        capitulos: [
            {
                nombre: 'Capítulo I - Criterios de Evaluación',
                expandido: false,
                clausulas: [
                    {
                        id: 11,
                        nombre: 'Criterio precio',
                        bloqueada: false,
                        obligatoria: true,
                        editable: false,
                        clausula: {
                            id: 1,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                    {
                        id: 12,
                        nombre: 'Criterios técnicos',
                        bloqueada: false,
                        obligatoria: true,
                        editable: false,
                        clausula: {
                            id: 2,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                    {
                        id: 13,
                        nombre: 'Puntajes',
                        bloqueada: false,
                        obligatoria: true,
                        editable: false,
                        clausula: {
                            id: 3,
                            denominacion: '',
                            objetosCompra: [],
                            estado: EstadoElemento.VIGENTE,
                            organismo: undefined,
                            tiposCompra: [],
                            redacciones: [],
                        },
                    },
                ] as any,
                capitulo: {
                    id: 1,
                    denominacion: '',
                    clausulas: [],
                    estado: EstadoElemento.VIGENTE,
                },
            },
        ],
        seccion: {
            id: 1,
            denominacion: 'sección 1',
            estado: EstadoElemento.VIGENTE,
            capitulos: [],
            clausulas: [],
        },
        clausulas: [],
        soloClausulas: false,
    },
    {
        nombre: 'Sección IV - Con cláusulas',
        expandida: false,
        capitulos: [],
        clausulas: [
            {
                id: 11,
                nombre: 'Cláusula vacía',
                bloqueada: false,
                obligatoria: true,
                editable: false,
                clausula: {
                    id: 1,
                    denominacion: 'denominación 1',
                    objetosCompra: [],
                    estado: EstadoElemento.VIGENTE,
                    organismo: undefined,
                    tiposCompra: [],
                    redacciones: [],
                },
            },
        ] as any,
        seccion: {
            id: 1,
            denominacion: 'sección 1',
            estado: EstadoElemento.VIGENTE,
            capitulos: [],
            clausulas: [],
        },
        soloClausulas: true,
    },
];

@Injectable({
    providedIn: 'root',
})
export class ElaborarPliegoService {
    obtenerUsuariosAsignadosMock(): UsuarioAsignadoPliegoDTO[] {
        return USUARIOS_ASIGNADOS_MOCK.map((usuario) => ({ ...usuario }));
    }

    obtenerHistorialTareasMock(): TareaHistorialDTO[] {
        return HISTORIAL_TAREAS_MOCK.map((tarea) => ({
            ...tarea,
            fecha: new Date(tarea.fecha),
        }));
    }

    obtenerSeccionesMock(): SeccionPliegoDTO[] {
        return JSON.parse(JSON.stringify(SECCIONES_MOCK)) as SeccionPliegoDTO[];
    }

    crearPliegoDemo(
        id: number,
        inciso: string = '',
        unidadEjecutora: string = '',
        tipoCompra: string = '',
        subtipoCompra: string = '',
        numeroCompra: number = 0,
        anioCompra: number = 0,
    ): PliegoDTO {
        return {
            id,
            modelo: {
                id: 0,
                denominacion: '',
                fechaVigenciaDesde: null,
                fechaVigenciaHasta: null,
                estado: null as any,
                version: 0,
                secciones: [],
                tiposCompra: [],
                organismo: undefined,
                fechaCreacion: null,
                usuarioCreacion: null,
                fechaModificacion: null,
                usuarioModificacion: null,
            },
            notas: [],
            estado: EstadoPliego.EN_PROCESO,
            unidadEjecutora: {
                id: 0,
                inciso: { idInciso: 0, descInciso: inciso },
                idUnidadEjecutora: 0,
                descUnidadEjecutora: unidadEjecutora,
            },
            subtipoCompra: {
                idTipoCompra: '1',
                idSubtipoCompra: '1',
                descTipoCompra: tipoCompra,
                descSubtipoCompra: subtipoCompra,
            },
            numeroCompra,
            anioCompra,
            aperturaElectronica: SiNoAmbasValor.SI,
            fechaPublicacion: undefined,
            version: 1,
            campos: {
                id: 0,
                valorString: '',
                campo: {} as any,
                bloqueado: 'N',
            },
            historial: [],
        };
    }
}
